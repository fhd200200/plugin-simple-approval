"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@nocobase/server");
const approval_engine_1 = require("./services/approval-engine");
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
class PluginSimpleApprovalServer extends server_1.Plugin {
    async load() {
        var _a, _b;
        const app = this.app;
        const db = app.db;
        const logger = app.logger || console;
        const txOpts = (tx) => (tx ? { transaction: tx } : {});
        // ------------------------------------------------------------------
        // Repository adapter: everything the engine needs from NocoBase DB
        // ------------------------------------------------------------------
        const repo = {
            transaction: async (fn) => db.transaction(fn),
            getTemplate: async (id, tx) => db.getRepository('approval_templates').findOne({ filterByTk: id, ...txOpts(tx) }),
            getSteps: async (templateId, tx) => db.getRepository('approval_steps').find({ filter: { templateId }, sort: 'stepOrder', ...txOpts(tx) }),
            resolveApprovers: async (step, _request, tx) => {
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
                    if (!role)
                        return [];
                    const users = await db
                        .getRepository('users')
                        .find({ filter: { 'roles.name': role.name }, fields: ['id'], ...txOpts(tx) });
                    return (users || []).map((u) => u.id);
                }
                return [];
            },
            createRequest: async (values, tx) => db.getRepository('approval_requests').create({ values, ...txOpts(tx) }),
            getRequest: async (id, tx) => db.getRepository('approval_requests').findOne({ filterByTk: id, ...txOpts(tx) }),
            findOpenRequest: async (collection, recordId, tx) => db.getRepository('approval_requests').findOne({
                filter: {
                    targetCollection: collection,
                    targetRecordId: String(recordId),
                    'status.$in': ['pending', 'in_progress'],
                },
                ...txOpts(tx),
            }),
            updateRequest: async (id, patch, tx) => db.getRepository('approval_requests').update({ filterByTk: id, values: patch, ...txOpts(tx) }),
            addAction: async (data, tx) => {
                await db.getRepository('approval_actions').create({ values: { createdAt: new Date(), ...data }, ...txOpts(tx) });
            },
            countStepApproverApprovals: async (requestId, stepId, tx) => {
                const rows = await db
                    .getRepository('approval_actions')
                    .find({ filter: { requestId, stepId, action: 'approved' }, ...txOpts(tx) });
                return new Set((rows || []).map((r) => r.actorId)).size;
            },
            snapshot: async (requestId, data, tx) => {
                await db
                    .getRepository('approval_snapshots')
                    .create({ values: { requestId, snapshotData: data, createdAt: new Date() }, ...txOpts(tx) });
            },
            nextRequestNo: async () => `APR-${Date.now().toString(36).toUpperCase()}`,
            updateTargetRecord: async (collection, recordId, values, tx) => {
                await db.getRepository(collection).update({ filterByTk: recordId, values, ...txOpts(tx) });
            },
        };
        this.engine = new approval_engine_1.ApprovalEngine(repo, logger);
        // ------------------------------------------------------------------
        // Helpers
        // ------------------------------------------------------------------
        const currentUserId = (ctx) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const id = (_h = (_f = (_c = (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.state) === null || _a === void 0 ? void 0 : _a.currentUser) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : (_e = (_d = ctx === null || ctx === void 0 ? void 0 : ctx.auth) === null || _d === void 0 ? void 0 : _d.user) === null || _e === void 0 ? void 0 : _e.id) !== null && _f !== void 0 ? _f : (_g = ctx === null || ctx === void 0 ? void 0 : ctx.state) === null || _g === void 0 ? void 0 : _g.currentUserId) !== null && _h !== void 0 ? _h : null;
            return id != null ? Number(id) : null;
        };
        const getUserWithRoles = async (ctx) => {
            const uid = currentUserId(ctx);
            if (!uid)
                return null;
            try {
                return await db.getRepository('users').findOne({ filterByTk: uid, appends: ['roles'] });
            }
            catch (e) {
                try {
                    return await db.getRepository('users').findOne({ filterByTk: uid });
                }
                catch (e2) {
                    return null;
                }
            }
        };
        const isAdminUser = async (ctx) => {
            const user = await getUserWithRoles(ctx);
            return !!((user === null || user === void 0 ? void 0 : user.roles) || []).some((r) => (r === null || r === void 0 ? void 0 : r.name) === 'admin');
        };
        const getBody = (ctx) => {
            var _a, _b, _c;
            const values = (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.action) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.values;
            if (values && typeof values === 'object' && Object.keys(values).length)
                return values;
            return ((_c = ctx === null || ctx === void 0 ? void 0 : ctx.request) === null || _c === void 0 ? void 0 : _c.body) || {};
        };
        const getQuery = (ctx, key) => { var _a, _b, _c, _d, _e; return (_e = (_c = (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.action) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b[key]) !== null && _c !== void 0 ? _c : (_d = ctx === null || ctx === void 0 ? void 0 : ctx.query) === null || _d === void 0 ? void 0 : _d[key]) !== null && _e !== void 0 ? _e : undefined; };
        const userMap = async (ids) => {
            const unique = [...new Set((ids || []).filter((x) => x != null).map(Number))];
            if (!unique.length)
                return {};
            const rows = await db.getRepository('users').find({ filter: { 'id.$in': unique } });
            const map = {};
            (rows || []).forEach((u) => {
                map[u.id] = u.nickname || u.username || `#${u.id}`;
            });
            return map;
        };
        const templateMap = async (ids) => {
            const unique = [...new Set((ids || []).filter((x) => x != null).map(Number))];
            if (!unique.length)
                return {};
            const rows = await db.getRepository('approval_templates').find({ filter: { 'id.$in': unique } });
            const map = {};
            (rows || []).forEach((t) => {
                map[t.id] = t.name || `#${t.id}`;
            });
            return map;
        };
        const plain = (obj) => (obj && typeof obj.toJSON === 'function' ? obj.toJSON() : obj);
        const enrichRequests = async (rows) => {
            const list = (rows || []).map(plain);
            const tMap = await templateMap(list.map((r) => r.templateId));
            const uMap = await userMap(list.flatMap((r) => [r.submittedBy, ...(r.currentApprovers || [])]));
            return list.map((r) => ({
                ...r,
                templateName: tMap[r.templateId] || `#${r.templateId}`,
                submittedByName: uMap[r.submittedBy] || `#${r.submittedBy}`,
                currentApproverNames: (r.currentApprovers || []).map((id) => uMap[id] || `#${id}`),
            }));
        };
        const deactivateOtherTemplates = async (collection, keepId, tx) => {
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
        const resolveRequestId = async (ctx, body) => {
            var _a, _b, _c, _d;
            const tk = Number((_c = (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.action) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.filterByTk) !== null && _c !== void 0 ? _c : body.requestId);
            if (tk)
                return tk;
            if (body.collection && body.recordId != null) {
                const r = await db.getRepository('approval_requests').findOne({
                    filter: {
                        targetCollection: body.collection,
                        targetRecordId: String(body.recordId),
                        'status.$in': ['pending', 'in_progress'],
                    },
                });
                return (_d = r === null || r === void 0 ? void 0 : r.id) !== null && _d !== void 0 ? _d : null;
            }
            return null;
        };
        const runEngineAction = async (ctx, next, actionName) => {
            const uid = currentUserId(ctx);
            if (!uid)
                return ctx.throw(401, 'Please sign in first.');
            const body = getBody(ctx);
            const requestId = await resolveRequestId(ctx, body);
            if (!requestId)
                return ctx.throw(404, 'No open approval request found for this record.');
            const admin = await isAdminUser(ctx);
            try {
                const result = await this.engine.act({
                    requestId,
                    actorId: uid,
                    action: actionName,
                    comment: body.reason || body.comment,
                    isAdmin: admin,
                });
                ctx.body = { data: plain(result) };
            }
            catch (e) {
                if (e instanceof approval_engine_1.ApprovalError)
                    return ctx.throw(400, e.message);
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
                summary: async (ctx, next) => {
                    const uid = currentUserId(ctx);
                    if (!uid)
                        return ctx.throw(401, 'Please sign in first.');
                    const requestsRepo = db.getRepository('approval_requests');
                    const open = await requestsRepo.find({ filter: { 'status.$in': ['pending', 'in_progress'] } });
                    const myApprovals = (open || []).filter((r) => (r.currentApprovers || []).map(Number).includes(uid));
                    const myRequests = await requestsRepo.find({ filter: { submittedBy: uid } });
                    ctx.body = {
                        data: {
                            pendingApprovals: myApprovals.length,
                            myRequests: (myRequests || []).length,
                            inProgress: (myRequests || []).filter((r) => ['pending', 'in_progress'].includes(r.status)).length,
                            approved: (myRequests || []).filter((r) => r.status === 'approved').length,
                            rejected: (myRequests || []).filter((r) => r.status === 'rejected').length,
                        },
                    };
                    await next();
                },
                myApprovals: async (ctx, next) => {
                    const uid = currentUserId(ctx);
                    if (!uid)
                        return ctx.throw(401, 'Please sign in first.');
                    const open = await db
                        .getRepository('approval_requests')
                        .find({ filter: { 'status.$in': ['pending', 'in_progress'] }, sort: '-submittedAt' });
                    const rows = (open || []).filter((r) => (r.currentApprovers || []).map(Number).includes(uid));
                    ctx.body = { data: await enrichRequests(rows) };
                    await next();
                },
                myRequests: async (ctx, next) => {
                    const uid = currentUserId(ctx);
                    if (!uid)
                        return ctx.throw(401, 'Please sign in first.');
                    const rows = await db
                        .getRepository('approval_requests')
                        .find({ filter: { submittedBy: uid }, sort: '-submittedAt' });
                    ctx.body = { data: await enrichRequests(rows) };
                    await next();
                },
                recordRequests: async (ctx, next) => {
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
                getRequest: async (ctx, next) => {
                    var _a, _b, _c, _d, _e;
                    const id = Number((_c = (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.action) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.filterByTk) !== null && _c !== void 0 ? _c : getQuery(ctx, 'requestId'));
                    if (!id)
                        return ctx.throw(400, 'Request id is required.');
                    const r = await db.getRepository('approval_requests').findOne({ filterByTk: id });
                    if (!r)
                        return ctx.throw(404, 'Approval request not found.');
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
                        ...(actions || []).map((a) => a.actorId),
                    ]);
                    const request = plain(r);
                    ctx.body = {
                        data: {
                            ...request,
                            templateName: (template === null || template === void 0 ? void 0 : template.name) || `#${r.templateId}`,
                            steps: (steps || []).map(plain),
                            snapshot: (_e = (_d = plain(snapshot)) === null || _d === void 0 ? void 0 : _d.snapshotData) !== null && _e !== void 0 ? _e : null,
                            history: (actions || []).map((a) => ({
                                ...plain(a),
                                actorName: uMap[a.actorId] || `#${a.actorId}`,
                            })),
                            canApprove: ['pending', 'in_progress'].includes(r.status) &&
                                (r.currentApprovers || []).map(Number).includes(uid),
                            canCancel: ['pending', 'in_progress'].includes(r.status) &&
                                (Number(r.submittedBy) === Number(uid) || admin),
                        },
                    };
                    await next();
                },
                submit: async (ctx, next) => {
                    var _a, _b;
                    const uid = currentUserId(ctx);
                    if (!uid)
                        return ctx.throw(401, 'Please sign in first.');
                    const body = getBody(ctx);
                    const collection = body.collection || body.targetCollection;
                    const recordId = (_a = body.recordId) !== null && _a !== void 0 ? _a : body.targetRecordId;
                    if (!collection || recordId == null) {
                        return ctx.throw(400, 'collection and recordId are required.');
                    }
                    const template = await db
                        .getRepository('approval_templates')
                        .findOne({ filter: { targetCollection: collection, active: true } });
                    if (!template) {
                        return ctx.throw(400, `No active approval template is configured for collection "${collection}". Create one in the Simple Approval settings first.`);
                    }
                    const steps = await db
                        .getRepository('approval_steps')
                        .find({ filter: { templateId: template.id }, sort: 'stepOrder' });
                    if (!(steps || []).length) {
                        return ctx.throw(400, 'The approval template has no steps. Add at least one step.');
                    }
                    let snapshot = null;
                    try {
                        const record = await db.getRepository(collection).findOne({ filterByTk: recordId });
                        snapshot = plain(record);
                    }
                    catch (e) {
                        (_b = logger === null || logger === void 0 ? void 0 : logger.warn) === null || _b === void 0 ? void 0 : _b.call(logger, `[simple-approval] could not load record ${collection}#${recordId} for snapshot`);
                    }
                    if (!snapshot) {
                        return ctx.throw(404, `Record ${recordId} was not found in "${collection}".`);
                    }
                    try {
                        const request = await this.engine.submit({
                            template,
                            steps,
                            targetCollection: collection,
                            targetRecordId: String(recordId),
                            userId: uid,
                            snapshot,
                        });
                        ctx.body = { data: plain(request) };
                    }
                    catch (e) {
                        if (e instanceof approval_engine_1.ApprovalError)
                            return ctx.throw(400, e.message);
                        logger.error('[simple-approval] submit failed', e);
                        return ctx.throw(500, 'Failed to create the approval request. Check the server logs.');
                    }
                    await next();
                },
                approve: async (ctx, next) => runEngineAction(ctx, next, 'approved'),
                reject: async (ctx, next) => runEngineAction(ctx, next, 'rejected'),
                return: async (ctx, next) => runEngineAction(ctx, next, 'returned'),
                cancel: async (ctx, next) => runEngineAction(ctx, next, 'cancelled'),
                // ---------------- admin only ------------------
                listTemplates: async (ctx, next) => {
                    const templates = await db.getRepository('approval_templates').find({ sort: 'id' });
                    const steps = await db.getRepository('approval_steps').find({ sort: 'stepOrder' });
                    const byTemplate = {};
                    (steps || []).forEach((s) => {
                        const step = plain(s);
                        (byTemplate[step.templateId] = byTemplate[step.templateId] || []).push(step);
                    });
                    ctx.body = {
                        data: (templates || []).map((t) => {
                            const template = plain(t);
                            return {
                                ...template,
                                steps: (byTemplate[template.id] || []).sort((a, b) => a.stepOrder - b.stepOrder),
                            };
                        }),
                    };
                    await next();
                },
                createTemplate: async (ctx, next) => {
                    const body = getBody(ctx);
                    const name = (body.name || '').trim();
                    const targetCollection = (body.targetCollection || '').trim();
                    const steps = Array.isArray(body.steps) ? body.steps : [];
                    if (!name)
                        return ctx.throw(400, 'Template name is required.');
                    if (!targetCollection)
                        return ctx.throw(400, 'Target collection is required.');
                    if (!steps.length)
                        return ctx.throw(400, 'At least one approval step is required.');
                    for (const s of steps) {
                        if (!(s.name || '').trim())
                            return ctx.throw(400, 'Every step needs a name.');
                        if (!['user', 'users', 'role'].includes(s.approverType)) {
                            return ctx.throw(400, `Step "${s.name}" has an invalid approver type.`);
                        }
                    }
                    let created;
                    try {
                        created = await db.transaction(async (tx) => {
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
                    }
                    catch (e) {
                        if (String((e === null || e === void 0 ? void 0 : e.message) || '').includes('existing row')) {
                            return ctx.throw(400, `A template named "${name}" already exists.`);
                        }
                        logger.error('[simple-approval] createTemplate failed', e);
                        return ctx.throw(500, 'Failed to create the template. Check the server logs.');
                    }
                    ctx.body = { data: plain(created) };
                    await next();
                },
                updateTemplate: async (ctx, next) => {
                    var _a, _b, _c;
                    const id = Number((_c = (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.action) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.filterByTk) !== null && _c !== void 0 ? _c : getBody(ctx).id);
                    if (!id)
                        return ctx.throw(400, 'Template id is required.');
                    const body = getBody(ctx);
                    const existing = await db.getRepository('approval_templates').findOne({ filterByTk: id });
                    if (!existing)
                        return ctx.throw(404, 'Template not found.');
                    const steps = Array.isArray(body.steps) ? body.steps : [];
                    if (body.name != null && !String(body.name).trim()) {
                        return ctx.throw(400, 'Template name is required.');
                    }
                    if (body.targetCollection != null && !String(body.targetCollection).trim()) {
                        return ctx.throw(400, 'Target collection is required.');
                    }
                    if (steps.length) {
                        for (const s of steps) {
                            if (!(s.name || '').trim())
                                return ctx.throw(400, 'Every step needs a name.');
                        }
                    }
                    await db.transaction(async (tx) => {
                        const patch = { version: (existing.version || 1) + 1 };
                        for (const key of ['name', 'description', 'targetCollection', 'statusField', 'statusMapping', 'active']) {
                            if (body[key] !== undefined)
                                patch[key] = body[key];
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
                destroyTemplate: async (ctx, next) => {
                    var _a, _b, _c;
                    const id = Number((_c = (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.action) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.filterByTk) !== null && _c !== void 0 ? _c : getBody(ctx).id);
                    if (!id)
                        return ctx.throw(400, 'Template id is required.');
                    const existing = await db.getRepository('approval_templates').findOne({ filterByTk: id });
                    if (!existing)
                        return ctx.throw(404, 'Template not found.');
                    const open = await db.getRepository('approval_requests').count({
                        filter: { templateId: id, 'status.$in': ['pending', 'in_progress'] },
                    });
                    if (open > 0) {
                        return ctx.throw(400, 'This template has requests in progress and cannot be deleted.');
                    }
                    await db.transaction(async (tx) => {
                        await db.getRepository('approval_steps').destroy({ filter: { templateId: id }, transaction: tx });
                        await db.getRepository('approval_templates').destroy({ filterByTk: id, transaction: tx });
                    });
                    ctx.body = { data: { id } };
                    await next();
                },
                listCollections: async (ctx, next) => {
                    var _a, _b;
                    let list = [];
                    try {
                        const rows = await db.getRepository('collections').find();
                        list = (rows || [])
                            .map((r) => ({ name: r.name, title: r.title || r.name }))
                            .filter((c) => !!c.name);
                    }
                    catch (e) {
                        try {
                            (_b = (_a = db.collections) === null || _a === void 0 ? void 0 : _a.forEach) === null || _b === void 0 ? void 0 : _b.call(_a, (c) => {
                                var _a, _b;
                                const name = (c === null || c === void 0 ? void 0 : c.name) || ((_a = c === null || c === void 0 ? void 0 : c.options) === null || _a === void 0 ? void 0 : _a.name);
                                if (name)
                                    list.push({ name, title: ((_b = c === null || c === void 0 ? void 0 : c.options) === null || _b === void 0 ? void 0 : _b.title) || name });
                            });
                        }
                        catch (e2) {
                            list = [];
                        }
                    }
                    const data = list.filter((c) => !c.name.startsWith('approval_') && !SYSTEM_COLLECTION_NAMES.has(c.name));
                    ctx.body = { data };
                    await next();
                },
                listRoles: async (ctx, next) => {
                    const roles = await db.getRepository('roles').find({ sort: 'title' });
                    ctx.body = {
                        data: (roles || []).map((r) => ({ name: r.name, title: r.title || r.name })),
                    };
                    await next();
                },
                searchUsers: async (ctx, next) => {
                    const kw = String(getQuery(ctx, 'keyword') || '').trim();
                    let filter = {};
                    if (kw) {
                        filter = {
                            $or: [{ 'nickname.$includes': kw }, { 'username.$includes': kw }],
                        };
                    }
                    let rows = [];
                    try {
                        rows = await db
                            .getRepository('users')
                            .find({ filter, limit: 20, fields: ['id', 'nickname', 'username'] });
                    }
                    catch (e) {
                        rows = await db.getRepository('users').find({ filter, limit: 20 });
                    }
                    ctx.body = {
                        data: (rows || []).map((u) => ({
                            id: u.id,
                            label: `${u.nickname || u.username || `#${u.id}`} (#${u.id})`,
                        })),
                    };
                    await next();
                },
                allRequests: async (ctx, next) => {
                    const admin = await isAdminUser(ctx);
                    if (!admin)
                        return ctx.throw(403, 'Administrator access is required.');
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
        app.acl.allow('approval', ADMIN_ACTIONS, async (ctx) => isAdminUser(ctx));
        (_b = (_a = app.logger) === null || _a === void 0 ? void 0 : _a.info) === null || _b === void 0 ? void 0 : _b.call(_a, '[simple-approval] loaded (workflow-independent approval engine)');
    }
}
exports.default = PluginSimpleApprovalServer;
