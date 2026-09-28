import { Plugin } from '@nocobase/server';
import { ApprovalEngine, ApprovalError } from './services/approval-engine';

const USER_ACTIONS = [
  'summary',
  'myApprovals',
  'myRequests',
  'getRequest',
  'recordRequests',
  'submit',
  'approve',
  'reject',
  'return',
  'cancel',
];

const ADMIN_ACTIONS = [
  'listTemplates',
  'createTemplate',
  'updateTemplate',
  'destroyTemplate',
  'listCollections',
  'listRoles',
  'searchUsers',
  'allRequests',
];

const SYSTEM_COLLECTION_NAMES = new Set([
  'users',
  'roles',
  'collections',
  'collectionCategories',
  'collectionCategoryItems',
  'applicationPlugins',
  'applicationDescriptions',
  'locales',
  'authenticators',
  'applications',
  'users_authenticators',
  'roles_users',
  'tags',
  'tags_users',
  'aiEmployees',
  'comments',
  'commentSubscriptions',
]);

export default class PluginSimpleApprovalServer extends Plugin {
  engine?: ApprovalEngine;

  async load() {
    const app: any = this.app;
    const db = app.db;
    const logger = app.logger || console;

    const txOpts = (tx?: any) => (tx ? { transaction: tx } : {});

    // ------------------------------------------------------------------
    // Repository adapter: everything the engine needs from NocoBase DB
    // ------------------------------------------------------------------
    const repo = {
      transaction: async <T>(fn: (tx: any) => Promise<T>): Promise<T> => db.transaction(fn),
      getTemplate: async (id: number, tx?: any) =>
        db.getRepository('approval_templates').findOne({ filterByTk: id, ...txOpts(tx) }),
      getSteps: async (templateId: number, tx?: any) =>
        db.getRepository('approval_steps').find({ filter: { templateId }, sort: 'stepOrder', ...txOpts(tx) }),
      resolveApprovers: async (step: any, _request: any, tx?: any) => {
        const cfg = step.approverConfig || {};
        if (step.approverType === 'user') {
          return cfg.userId ? [Number(cfg.userId)] : [];
        }
        if (step.approverType === 'users') {
          return (Array.isArray(cfg.userIds) ? cfg.userIds : []).filter(Boolean).map(Number);
        }
        if (step.approverType === 'role') {
          const roleRepo = db.getRepository('roles');
          const role = cfg.roleName
            ? await roleRepo.findOne({ filter: { name: cfg.roleName }, ...txOpts(tx) })
            : cfg.roleId
              ? await roleRepo.findOne({ filterByTk: cfg.roleId, ...txOpts(tx) })
              : null;
          if (!role) return [];
          const users = await db
            .getRepository('users')
            .find({ filter: { 'roles.name': role.name }, fields: ['id'], ...txOpts(tx) });
          return (users || []).map((u: any) => u.id);
        }
        return [];
      },
      createRequest: async (values: any, tx?: any) =>
        db.getRepository('approval_requests').create({ values, ...txOpts(tx) }),
      getRequest: async (id: number, tx?: any) =>
        db.getRepository('approval_requests').findOne({ filterByTk: id, ...txOpts(tx) }),
      findOpenRequest: async (collection: string, recordId: string, tx?: any) =>
        db.getRepository('approval_requests').findOne({
          filter: {
            targetCollection: collection,
            targetRecordId: String(recordId),
            'status.$in': ['pending', 'in_progress'],
          },
          ...txOpts(tx),
        }),
      updateRequest: async (id: number, patch: any, tx?: any) =>
        db.getRepository('approval_requests').update({ filterByTk: id, values: patch, ...txOpts(tx) }),
      addAction: async (data: any, tx?: any) => {
        await db.getRepository('approval_actions').create({ values: { createdAt: new Date(), ...data }, ...txOpts(tx) });
      },
      countStepApproverApprovals: async (requestId: number, stepId: number, tx?: any) => {
        const rows = await db
          .getRepository('approval_actions')
          .find({ filter: { requestId, stepId, action: 'approved' }, ...txOpts(tx) });
        return new Set((rows || []).map((r: any) => r.actorId)).size;
      },
      snapshot: async (requestId: number, data: any, tx?: any) => {
        await db
          .getRepository('approval_snapshots')
          .create({ values: { requestId, snapshotData: data, createdAt: new Date() }, ...txOpts(tx) });
      },
      nextRequestNo: async () => `APR-${Date.now().toString(36).toUpperCase()}`,
      updateTargetRecord: async (collection: string, recordId: string, values: any, tx?: any) => {
        await db.getRepository(collection).update({ filterByTk: recordId, values, ...txOpts(tx) });
      },
    };

    this.engine = new ApprovalEngine(repo, logger);

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    const currentUserId = (ctx: any): number | null => {
      const id =
        ctx?.state?.currentUser?.id ?? ctx?.auth?.user?.id ?? ctx?.state?.currentUserId ?? null;
      return id != null ? Number(id) : null;
    };

    const getUserWithRoles = async (ctx: any) => {
      const uid = currentUserId(ctx);
      if (!uid) return null;
      try {
        return await db.getRepository('users').findOne({ filterByTk: uid, appends: ['roles'] });
      } catch (e) {
        try {
          return await db.getRepository('users').findOne({ filterByTk: uid });
        } catch (e2) {
          return null;
        }
      }
    };

    const isAdminUser = async (ctx: any) => {
      const user = await getUserWithRoles(ctx);
      return !!((user as any)?.roles || []).some((r: any) => r?.name === 'admin');
    };

    const getBody = (ctx: any) => {
      const values = ctx?.action?.params?.values;
      if (values && typeof values === 'object' && Object.keys(values).length) return values;
      return ctx?.request?.body || {};
    };

    const getQuery = (ctx: any, key: string) =>
      ctx?.action?.params?.[key] ?? ctx?.query?.[key] ?? undefined;

    const userMap = async (ids: any[]) => {
      const unique = [...new Set((ids || []).filter((x: any) => x != null).map(Number))];
      if (!unique.length) return {} as any;
      const rows = await db.getRepository('users').find({ filter: { 'id.$in': unique } });
      const map: any = {};
      (rows || []).forEach((u: any) => {
        map[u.id] = u.nickname || u.username || `#${u.id}`;
      });
      return map;
    };

    const templateMap = async (ids: any[]) => {
      const unique = [...new Set((ids || []).filter((x: any) => x != null).map(Number))];
      if (!unique.length) return {} as any;
      const rows = await db.getRepository('approval_templates').find({ filter: { 'id.$in': unique } });
      const map: any = {};
      (rows || []).forEach((t: any) => {
        map[t.id] = t.name || `#${t.id}`;
      });
      return map;
    };

    const plain = (obj: any) => (obj && typeof obj.toJSON === 'function' ? obj.toJSON() : obj);

    const enrichRequests = async (rows: any[]) => {
      const list = (rows || []).map(plain);
      const tMap = await templateMap(list.map((r: any) => r.templateId));
      const uMap = await userMap(
        list.flatMap((r: any) => [r.submittedBy, ...(r.currentApprovers || [])]),
      );
      return list.map((r: any) => ({
        ...r,
        templateName: tMap[r.templateId] || `#${r.templateId}`,
        submittedByName: uMap[r.submittedBy] || `#${r.submittedBy}`,
        currentApproverNames: (r.currentApprovers || []).map(
          (id: number) => uMap[id] || `#${id}`,
        ),
      }));
    };

    const deactivateOtherTemplates = async (collection: string, keepId: number, tx?: any) => {
      const rows = await db
        .getRepository('approval_templates')
        .find({ filter: { targetCollection: collection, active: true }, ...txOpts(tx) });
      for (const t of rows || []) {
        if (t.id !== keepId) {
          await db
            .getRepository('approval_templates')
            .update({ filterByTk: t.id, values: { active: false }, ...txOpts(tx) });
        }
      }
    };

    const resolveRequestId = async (ctx: any, body: any): Promise<number | null> => {
      const tk = Number(ctx?.action?.params?.filterByTk ?? body.requestId);
      if (tk) return tk;
      if (body.collection && body.recordId != null) {
        const r = await db.getRepository('approval_requests').findOne({
          filter: {
            targetCollection: body.collection,
            targetRecordId: String(body.recordId),
            'status.$in': ['pending', 'in_progress'],
          },
        });
        return r?.id ?? null;
      }
      return null;
    };

    const runEngineAction = async (ctx: any, next: any, actionName: 'approved' | 'rejected' | 'returned' | 'cancelled') => {
      const uid = currentUserId(ctx);
      if (!uid) return ctx.throw(401, 'Please sign in first.');
      const body = getBody(ctx);
      const requestId = await resolveRequestId(ctx, body);
      if (!requestId) return ctx.throw(404, 'No open approval request found for this record.');
      const admin = await isAdminUser(ctx);
      try {
        const result = await this.engine!.act({
          requestId,
          actorId: uid,
          action: actionName,
          comment: body.reason || body.comment,
          isAdmin: admin,
        });
        ctx.body = { data: plain(result) };
      } catch (e: any) {
        if (e instanceof ApprovalError) return ctx.throw(400, e.message);
        logger.error('[simple-approval] action failed', e);
        return ctx.throw(500, 'The approval action failed. Check the server logs.');
      }
      await next();
    };

    // ------------------------------------------------------------------
    // REST resource: /api/approval:<action>
    // ------------------------------------------------------------------
    app.resourceManager.define({
      name: 'approval',
      actions: {
        // ---------------- user facing -----------------
        summary: async (ctx: any, next: any) => {
          const uid = currentUserId(ctx);
          if (!uid) return ctx.throw(401, 'Please sign in first.');
          const requestsRepo = db.getRepository('approval_requests');
          const open = await requestsRepo.find({ filter: { 'status.$in': ['pending', 'in_progress'] } });
          const myApprovals = (open || []).filter((r: any) =>
            (r.currentApprovers || []).map(Number).includes(uid),
          );
          const myRequests = await requestsRepo.find({ filter: { submittedBy: uid } });
          ctx.body = {
            data: {
              pendingApprovals: myApprovals.length,
              myRequests: (myRequests || []).length,
              inProgress: (myRequests || []).filter((r: any) => ['pending', 'in_progress'].includes(r.status)).length,
              approved: (myRequests || []).filter((r: any) => r.status === 'approved').length,
              rejected: (myRequests || []).filter((r: any) => r.status === 'rejected').length,
            },
          };
          await next();
        },

        myApprovals: async (ctx: any, next: any) => {
          const uid = currentUserId(ctx);
          if (!uid) return ctx.throw(401, 'Please sign in first.');
          const open = await db
            .getRepository('approval_requests')
            .find({ filter: { 'status.$in': ['pending', 'in_progress'] }, sort: '-submittedAt' });
          const rows = (open || []).filter((r: any) =>
            (r.currentApprovers || []).map(Number).includes(uid),
          );
          ctx.body = { data: await enrichRequests(rows) };
          await next();
        },

        myRequests: async (ctx: any, next: any) => {
          const uid = currentUserId(ctx);
          if (!uid) return ctx.throw(401, 'Please sign in first.');
          const rows = await db
            .getRepository('approval_requests')
            .find({ filter: { submittedBy: uid }, sort: '-submittedAt' });
          ctx.body = { data: await enrichRequests(rows) };
          await next();
        },

        recordRequests: async (ctx: any, next: any) => {
          const collection = getQuery(ctx, 'collection');
          const recordId = getQuery(ctx, 'recordId');
          if (!collection || recordId == null) {
            return ctx.throw(400, 'collection and recordId are required.');
          }
          const rows = await db.getRepository('approval_requests').find({
            filter: { targetCollection: collection, targetRecordId: String(recordId) },
            sort: '-submittedAt',
          });
          ctx.body = { data: await enrichRequests(rows) };
          await next();
        },

        getRequest: async (ctx: any, next: any) => {
          const id = Number(ctx?.action?.params?.filterByTk ?? getQuery(ctx, 'requestId'));
          if (!id) return ctx.throw(400, 'Request id is required.');
          const r = await db.getRepository('approval_requests').findOne({ filterByTk: id });
          if (!r) return ctx.throw(404, 'Approval request not found.');
          const uid = currentUserId(ctx);
          const admin = await isAdminUser(ctx);
          const template = await db.getRepository('approval_templates').findOne({ filterByTk: r.templateId });
          const steps = await db
            .getRepository('approval_steps')
            .find({ filter: { templateId: r.templateId }, sort: 'stepOrder' });
          const actions = await db
            .getRepository('approval_actions')
            .find({ filter: { requestId: id }, sort: 'createdAt' });
          const snapshot = await db
            .getRepository('approval_snapshots')
            .findOne({ filter: { requestId: id } });
          const uMap = await userMap([
            r.submittedBy,
            ...(r.currentApprovers || []),
            ...(actions || []).map((a: any) => a.actorId),
          ]);
          const request = plain(r);
          ctx.body = {
            data: {
              ...request,
              templateName: template?.name || `#${r.templateId}`,
              steps: (steps || []).map(plain),
              snapshot: plain(snapshot)?.snapshotData ?? null,
              history: (actions || []).map((a: any) => ({
                ...plain(a),
                actorName: uMap[a.actorId] || `#${a.actorId}`,
              })),
              canApprove:
                ['pending', 'in_progress'].includes(r.status) &&
                (r.currentApprovers || []).map(Number).includes(uid),
              canCancel:
                ['pending', 'in_progress'].includes(r.status) &&
                (Number(r.submittedBy) === Number(uid) || admin),
            },
          };
          await next();
        },

        submit: async (ctx: any, next: any) => {
          const uid = currentUserId(ctx);
          if (!uid) return ctx.throw(401, 'Please sign in first.');
          const body = getBody(ctx);
          const collection = body.collection || body.targetCollection;
          const recordId = body.recordId ?? body.targetRecordId;
          if (!collection || recordId == null) {
            return ctx.throw(400, 'collection and recordId are required.');
          }
          const template = await db
            .getRepository('approval_templates')
            .findOne({ filter: { targetCollection: collection, active: true } });
          if (!template) {
            return ctx.throw(
              400,
              `No active approval template is configured for collection "${collection}". Create one in the Simple Approval settings first.`,
            );
          }
          const steps = await db
            .getRepository('approval_steps')
            .find({ filter: { templateId: template.id }, sort: 'stepOrder' });
          if (!(steps || []).length) {
            return ctx.throw(400, 'The approval template has no steps. Add at least one step.');
          }
          let snapshot: any = null;
          try {
            const record = await db.getRepository(collection).findOne({ filterByTk: recordId });
            snapshot = plain(record);
          } catch (e) {
            logger?.warn?.(`[simple-approval] could not load record ${collection}#${recordId} for snapshot`);
          }
          if (!snapshot) {
            return ctx.throw(404, `Record ${recordId} was not found in "${collection}".`);
          }
          try {
            const request = await this.engine!.submit({
              template,
              steps,
              targetCollection: collection,
              targetRecordId: String(recordId),
              userId: uid,
              snapshot,
            });
            ctx.body = { data: plain(request) };
          } catch (e: any) {
            if (e instanceof ApprovalError) return ctx.throw(400, e.message);
            logger.error('[simple-approval] submit failed', e);
            return ctx.throw(500, 'Failed to create the approval request. Check the server logs.');
          }
          await next();
        },

        approve: async (ctx: any, next: any) => runEngineAction(ctx, next, 'approved'),
        reject: async (ctx: any, next: any) => runEngineAction(ctx, next, 'rejected'),
        return: async (ctx: any, next: any) => runEngineAction(ctx, next, 'returned'),
        cancel: async (ctx: any, next: any) => runEngineAction(ctx, next, 'cancelled'),

        // ---------------- admin only ------------------
        listTemplates: async (ctx: any, next: any) => {
          const templates = await db.getRepository('approval_templates').find({ sort: 'id' });
          const steps = await db.getRepository('approval_steps').find({ sort: 'stepOrder' });
          const byTemplate: any = {};
          (steps || []).forEach((s: any) => {
            const step = plain(s);
            (byTemplate[step.templateId] = byTemplate[step.templateId] || []).push(step);
          });
          ctx.body = {
            data: (templates || []).map((t: any) => {
              const template = plain(t);
              return {
                ...template,
                steps: (byTemplate[template.id] || []).sort((a: any, b: any) => a.stepOrder - b.stepOrder),
              };
            }),
          };
          await next();
        },

        createTemplate: async (ctx: any, next: any) => {
          const body = getBody(ctx);
          const name = (body.name || '').trim();
          const targetCollection = (body.targetCollection || '').trim();
          const steps = Array.isArray(body.steps) ? body.steps : [];
          if (!name) return ctx.throw(400, 'Template name is required.');
          if (!targetCollection) return ctx.throw(400, 'Target collection is required.');
          if (!steps.length) return ctx.throw(400, 'At least one approval step is required.');
          for (const s of steps) {
            if (!(s.name || '').trim()) return ctx.throw(400, 'Every step needs a name.');
            if (!['user', 'users', 'role'].includes(s.approverType)) {
              return ctx.throw(400, `Step "${s.name}" has an invalid approver type.`);
            }
          }
          let created: any;
          try {
            created = await db.transaction(async (tx: any) => {
              const t = await db.getRepository('approval_templates').create({
                values: {
                  name,
                  description: body.description || '',
                  targetCollection,
                  statusField: body.statusField || '',
                  statusMapping: body.statusMapping || {},
                  active: !!body.active,
                  version: 1,
                },
                transaction: tx,
              });
              for (let i = 0; i < steps.length; i++) {
                await db.getRepository('approval_steps').create({
                  values: {
                    templateId: t.id,
                    name: (steps[i].name || '').trim(),
                    stepOrder: i + 1,
                    approverType: steps[i].approverType,
                    approverConfig: steps[i].approverConfig || {},
                    mode: steps[i].mode === 'parallel' ? 'parallel' : 'sequential',
                    completionRule: steps[i].completionRule === 'any' ? 'any' : 'all',
                    active: steps[i].active !== false,
                  },
                  transaction: tx,
                });
              }
              if (body.active) {
                await deactivateOtherTemplates(targetCollection, t.id, tx);
              }
              return t;
            });
          } catch (e: any) {
            if (String(e?.message || '').includes('existing row')) {
              return ctx.throw(400, `A template named "${name}" already exists.`);
            }
            logger.error('[simple-approval] createTemplate failed', e);
            return ctx.throw(500, 'Failed to create the template. Check the server logs.');
          }
          ctx.body = { data: plain(created) };
          await next();
        },

        updateTemplate: async (ctx: any, next: any) => {
          const id = Number(ctx?.action?.params?.filterByTk ?? getBody(ctx).id);
          if (!id) return ctx.throw(400, 'Template id is required.');
          const body = getBody(ctx);
          const existing = await db.getRepository('approval_templates').findOne({ filterByTk: id });
          if (!existing) return ctx.throw(404, 'Template not found.');
          const steps = Array.isArray(body.steps) ? body.steps : [];
          if (body.name != null && !String(body.name).trim()) {
            return ctx.throw(400, 'Template name is required.');
          }
          if (body.targetCollection != null && !String(body.targetCollection).trim()) {
            return ctx.throw(400, 'Target collection is required.');
          }
          if (steps.length) {
            for (const s of steps) {
              if (!(s.name || '').trim()) return ctx.throw(400, 'Every step needs a name.');
            }
          }
          await db.transaction(async (tx: any) => {
            const patch: any = { version: (existing.version || 1) + 1 };
            for (const key of ['name', 'description', 'targetCollection', 'statusField', 'statusMapping', 'active']) {
              if (body[key] !== undefined) patch[key] = body[key];
            }
            await db.getRepository('approval_templates').update({ filterByTk: id, values: patch, transaction: tx });
            if (steps.length) {
              await db.getRepository('approval_steps').destroy({ filter: { templateId: id }, transaction: tx });
              for (let i = 0; i < steps.length; i++) {
                await db.getRepository('approval_steps').create({
                  values: {
                    templateId: id,
                    name: (steps[i].name || '').trim(),
                    stepOrder: i + 1,
                    approverType: steps[i].approverType || 'user',
                    approverConfig: steps[i].approverConfig || {},
                    mode: steps[i].mode === 'parallel' ? 'parallel' : 'sequential',
                    completionRule: steps[i].completionRule === 'any' ? 'any' : 'all',
                    active: steps[i].active !== false,
                  },
                  transaction: tx,
                });
              }
            }
            if (patch.active) {
              await deactivateOtherTemplates(patch.targetCollection || existing.targetCollection, id, tx);
            }
          });
          const updated = await db.getRepository('approval_templates').findOne({ filterByTk: id });
          ctx.body = { data: plain(updated) };
          await next();
        },

        destroyTemplate: async (ctx: any, next: any) => {
          const id = Number(ctx?.action?.params?.filterByTk ?? getBody(ctx).id);
          if (!id) return ctx.throw(400, 'Template id is required.');
          const existing = await db.getRepository('approval_templates').findOne({ filterByTk: id });
          if (!existing) return ctx.throw(404, 'Template not found.');
          const open = await db.getRepository('approval_requests').count({
            filter: { templateId: id, 'status.$in': ['pending', 'in_progress'] },
          });
          if (open > 0) {
            return ctx.throw(400, 'This template has requests in progress and cannot be deleted.');
          }
          await db.transaction(async (tx: any) => {
            await db.getRepository('approval_steps').destroy({ filter: { templateId: id }, transaction: tx });
            await db.getRepository('approval_templates').destroy({ filterByTk: id, transaction: tx });
          });
          ctx.body = { data: { id } };
          await next();
        },

        listCollections: async (ctx: any, next: any) => {
          let list: { name: string; title: string }[] = [];
          try {
            const rows = await db.getRepository('collections').find();
            list = (rows || [])
              .map((r: any) => ({ name: r.name, title: r.title || r.name }))
              .filter((c: any) => !!c.name);
          } catch (e) {
            try {
              db.collections?.forEach?.((c: any) => {
                const name = c?.name || c?.options?.name;
                if (name) list.push({ name, title: c?.options?.title || name });
              });
            } catch (e2) {
              list = [];
            }
          }
          const data = list.filter(
            (c) => !c.name.startsWith('approval_') && !SYSTEM_COLLECTION_NAMES.has(c.name),
          );
          ctx.body = { data };
          await next();
        },

        listRoles: async (ctx: any, next: any) => {
          const roles = await db.getRepository('roles').find({ sort: 'title' });
          ctx.body = {
            data: (roles || []).map((r: any) => ({ name: r.name, title: r.title || r.name })),
          };
          await next();
        },

        searchUsers: async (ctx: any, next: any) => {
          const kw = String(getQuery(ctx, 'keyword') || '').trim();
          let filter: any = {};
          if (kw) {
            filter = {
              $or: [{ 'nickname.$includes': kw }, { 'username.$includes': kw }],
            };
          }
          let rows: any[] = [];
          try {
            rows = await db
              .getRepository('users')
              .find({ filter, limit: 20, fields: ['id', 'nickname', 'username'] });
          } catch (e) {
            rows = await db.getRepository('users').find({ filter, limit: 20 });
          }
          ctx.body = {
            data: (rows || []).map((u: any) => ({
              id: u.id,
              label: `${u.nickname || u.username || `#${u.id}`} (#${u.id})`,
            })),
          };
          await next();
        },

        allRequests: async (ctx: any, next: any) => {
          const admin = await isAdminUser(ctx);
          if (!admin) return ctx.throw(403, 'Administrator access is required.');
          const rows = await db
            .getRepository('approval_requests')
            .find({ sort: '-submittedAt', limit: 500 });
          ctx.body = { data: await enrichRequests(rows) };
          await next();
        },
      },
    });

    // ------------------------------------------------------------------
    // ACL: user actions for any signed-in user (row level checks are
    // enforced inside the handlers/engine), admin actions for admins.
    // ------------------------------------------------------------------
    app.acl.allow('approval', USER_ACTIONS, 'loggedIn');
    app.acl.allow('approval', ADMIN_ACTIONS, async (ctx: any) => isAdminUser(ctx));

    app.logger?.info?.('[simple-approval] loaded (workflow-independent approval engine)');
  }
}
