/**
 * Smoke test for the compiled server plugin.
 * Stubs @nocobase/server + @nocobase/database, mounts the plugin on a fake
 * NocoBase application (in-memory repositories) and exercises the REST actions.
 * Run: node test/server-plugin.test.js
 */
const test = require('node:test');
const assert = require('node:assert');
const Module = require('module');

// ---------------------------------------------------------------------
// Stub the NocoBase peer dependencies before requiring the plugin
// ---------------------------------------------------------------------
const stubs = {
  '@nocobase/server': { Plugin: class { constructor(app) { this.app = app; } } },
  '@nocobase/database': { defineCollection: (o) => o },
};
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (stubs[request]) return stubs[request];
  return originalLoad.apply(this, arguments);
};

const PluginSimpleApprovalServer = require('../dist/server/index').default;

// ---------------------------------------------------------------------
// Minimal in-memory NocoBase-like db with repository semantics
// ---------------------------------------------------------------------
function makeDb(seed) {
  const tables = {
    approval_templates: (seed.templates || []).map((r) => ({ ...r })),
    approval_steps: (seed.steps || []).map((r) => ({ ...r })),
    approval_requests: (seed.requests || []).map((r) => ({ ...r })),
    approval_actions: (seed.actions || []).map((r) => ({ ...r })),
    approval_snapshots: [],
    users: [
      { id: 1, nickname: 'Admin', username: 'admin', roles: [{ name: 'admin' }] },
      { id: 100, nickname: 'Mahmoud (submitter)', username: 'mhd', roles: [{ name: 'member' }] },
      { id: 101, nickname: 'Manager A', username: 'manager.a', roles: [{ name: 'member' }] },
      { id: 102, nickname: 'Manager B', username: 'manager.b', roles: [{ name: 'member' }] },
    ],
    roles: [
      { name: 'admin', title: 'Admin' },
      { name: 'member', title: 'Member' },
      { name: 'finance', title: 'Finance' },
    ],
    collections: [
      { name: 'purchaseRequests', title: 'Purchase Requests' },
      { name: 'approval_templates', title: 'Approval Templates' },
      { name: 'users', title: 'Users' },
    ],
    purchaseRequests: [
      { id: 501, title: 'Laptop', amount: 5000, status: 'draft' },
    ],
  };
  let seq = 1000;

  const matches = (row, filter) => {
    if (!filter) return true;
    return Object.entries(filter).every(([key, expected]) => {
      if (key === '$or') return expected.some((f) => matches(row, f));
      if (key.includes('.')) {
        const [field, op] = key.split('.');
        if (op === '$in') return expected.includes(row[field]);
        if (op === '$includes') {
          const v = row[field];
          if (Array.isArray(v)) return v.map(String).includes(String(expected));
          return String(v).includes(String(expected));
        }
        // association filter like roles.name
        if (op === 'name' && Array.isArray(row[field])) {
          return row[field].some((item) => item && item.name === expected);
        }
      }
      if (key === 'roles.name' && Array.isArray(row.roles)) {
        return row.roles.some((r) => r.name === expected);
      }
      return row[key] === expected;
    });
  };

  const repoFor = (name) => ({
    async find({ filter, sort, limit } = {}) {
      let rows = (tables[name] || []).filter((r) => matches(r, filter));
      if (sort) {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        rows = [...rows].sort((a, b) => {
          const av = a[field] ?? '';
          const bv = b[field] ?? '';
          const cmp = av > bv ? 1 : av < bv ? -1 : 0;
          return desc ? -cmp : cmp;
        });
      }
      if (limit) rows = rows.slice(0, limit);
      return rows.map((r) => ({ ...r }));
    },
    async findOne({ filter, filterByTk } = {}) {
      if (filterByTk !== undefined) {
        const row = (tables[name] || []).find((r) => String(r.id) === String(filterByTk));
        return row ? { ...row } : null;
      }
      const row = (tables[name] || []).find((r) => matches(r, filter || {}));
      return row ? { ...row } : null;
    },
    async count({ filter } = {}) {
      return (tables[name] || []).filter((r) => matches(r, filter || {})).length;
    },
    async create({ values } = {}) {
      const row = { id: ++seq, ...values };
      tables[name].push(row);
      return { ...row };
    },
    async update({ filterByTk, values, filter } = {}) {
      let targets = [];
      if (filterByTk !== undefined) {
        targets = (tables[name] || []).filter((r) => String(r.id) === String(filterByTk));
      } else {
        targets = (tables[name] || []).filter((r) => matches(r, filter || {}));
      }
      targets.forEach((t) => Object.assign(t, values));
      return targets.length;
    },
    async destroy({ filterByTk, filter } = {}) {
      let targets = [];
      if (filterByTk !== undefined) {
        targets = (tables[name] || []).filter((r) => String(r.id) === String(filterByTk));
      } else {
        targets = (tables[name] || []).filter((r) => matches(r, filter || {}));
      }
      const ids = new Set(targets.map((t) => t.id));
      tables[name] = (tables[name] || []).filter((r) => !ids.has(r.id));
      return ids.size;
    },
  });

  return {
    tables,
    getRepository: (name) => repoFor(name),
    transaction: async (fn) => fn({}),
  };
}

function makeApp(seed = {}) {
  const db = makeDb(seed);
  const defined = {};
  const allows = [];
  const app = {
    db,
    logger: { info() {}, warn() {}, error() {} },
    resourceManager: { define: (def) => Object.assign(defined, def) },
    acl: { allow: (name, actions, cond) => allows.push({ name, actions, cond }) },
  };
  return { app, defined, allows };
}

const userCtx = (userId, body = {}, filterByTk) => ({
  state: { currentUser: { id: userId } },
  action: { params: { values: body, filterByTk } },
  request: { body },
  query: {},
  throw(code, msg) {
    const err = new Error(msg);
    err.status = code;
    throw err;
  },
  body: undefined,
});

async function run(app, defined, action, ctx) {
  const handler = defined.actions[action];
  assert.ok(handler, `action ${action} must be defined`);
  await handler(ctx, async () => {});
  return ctx.body?.data;
}

test('plugin load(): defines resource and ACL rules', async () => {
  const { app, defined, allows } = makeApp();
  const plugin = new PluginSimpleApprovalServer(app);
  await plugin.load();
  assert.equal(defined.name, 'approval');
  const actionNames = Object.keys(defined.actions);
  for (const expected of [
    'summary', 'myApprovals', 'myRequests', 'getRequest', 'recordRequests',
    'submit', 'approve', 'reject', 'return', 'cancel',
    'listTemplates', 'createTemplate', 'updateTemplate', 'destroyTemplate',
    'listCollections', 'listRoles', 'searchUsers', 'allRequests',
  ]) {
    assert.ok(actionNames.includes(expected), `missing action: ${expected}`);
  }
  assert.equal(allows.length, 2);
  assert.equal(allows[0].cond, 'loggedIn');
  assert.equal(typeof allows[1].cond, 'function');
});

test('full lifecycle: createTemplate -> submit -> approve x2 -> approved + status mapping', async () => {
  const { app, defined } = makeApp();
  const plugin = new PluginSimpleApprovalServer(app);
  await plugin.load();

  // 1. admin creates a template (parallel "all" with two users)
  const template = await run(app, defined, 'createTemplate', userCtx(1, {
    name: 'Purchase approval',
    targetCollection: 'purchaseRequests',
    active: true,
    statusField: 'status',
    statusMapping: { submitted: 'pending', approved: 'approved', rejected: 'rejected', returned: 'draft', cancelled: 'draft' },
    steps: [
      { name: 'Managers', approverType: 'users', approverConfig: { userIds: [101, 102] }, mode: 'parallel', completionRule: 'all' },
    ],
  }));
  assert.ok(template.id);

  // 2. listTemplates shows it with steps
  const list = await run(app, defined, 'listTemplates', userCtx(1, {}));
  assert.equal(list.length, 1);
  assert.equal(list[0].steps.length, 1);
  assert.equal(list[0].steps[0].stepOrder, 1);

  // 3. submitter submits the purchase request
  const request = await run(app, defined, 'submit', userCtx(100, { collection: 'purchaseRequests', recordId: 501 }));
  assert.equal(request.status, 'in_progress');
  assert.deepEqual(request.currentApprovers, [101, 102]);
  assert.equal(app.db.tables.purchaseRequests[0].status, 'pending');

  // snapshot stored
  assert.equal(app.db.tables.approval_snapshots.length, 1);
  assert.equal(app.db.tables.approval_snapshots[0].snapshotData.title, 'Laptop');

  // 4. submit again -> blocked
  await assert.rejects(
    () => run(app, defined, 'submit', userCtx(100, { collection: 'purchaseRequests', recordId: 501 })),
    (e) => e.status === 400,
  );

  // 5. non-approver cannot approve
  await assert.rejects(
    () => run(app, defined, 'approve', userCtx(1, { collection: 'purchaseRequests', recordId: 501 })),
    (e) => e.status === 400,
  );

  // 6. first approver approves -> still in_progress (waiting for the second)
  let data = await run(app, defined, 'approve', userCtx(101, { collection: 'purchaseRequests', recordId: 501 }));
  assert.equal(data.status, 'in_progress');

  // 7. second approver approves -> request approved, record status written back
  data = await run(app, defined, 'approve', userCtx(102, { collection: 'purchaseRequests', recordId: 501 }));
  assert.equal(data.status, 'approved');
  assert.equal(app.db.tables.purchaseRequests[0].status, 'approved');

  // 8. getRequest returns full detail incl. history
  const detail = await run(app, defined, 'getRequest', userCtx(100, {}, request.id));
  assert.equal(detail.history.length, 3); // submitted + 2 approvals
  assert.ok(detail.history.every((h) => h.actorName));
  assert.equal(detail.snapshot.title, 'Laptop');
  assert.equal(detail.canApprove, false);
  assert.equal(detail.canCancel, false);
});

test('reject requires reason; cancel restricted to submitter/admin; my lists', async () => {
  const { app, defined } = makeApp({
    templates: [{ id: 9, name: 'T', version: 1, targetCollection: 'purchaseRequests', active: true, statusField: 'status', statusMapping: { rejected: 'rejected' } }],
    steps: [{ id: 91, templateId: 9, name: 'S1', stepOrder: 1, approverType: 'user', approverConfig: { userId: 101 }, mode: 'sequential', completionRule: 'all', active: true }],
  });
  const plugin = new PluginSimpleApprovalServer(app);
  await plugin.load();

  const request = await run(app, defined, 'submit', userCtx(100, { collection: 'purchaseRequests', recordId: 501 }));
  assert.equal(request.status, 'in_progress');

  // reject without reason fails
  await assert.rejects(
    () => run(app, defined, 'reject', userCtx(101, { collection: 'purchaseRequests', recordId: 501 })),
    (e) => e.status === 400,
  );

  // myApprovals for 101 contains the request
  const myApprovals = await run(app, defined, 'myApprovals', userCtx(101, {}));
  assert.equal(myApprovals.length, 1);
  assert.equal(myApprovals[0].templateName, 'T');

  // myRequests for 100
  const myRequests = await run(app, defined, 'myRequests', userCtx(100, {}));
  assert.equal(myRequests.length, 1);

  // summary for 101
  const summary = await run(app, defined, 'summary', userCtx(101, {}));
  assert.equal(summary.pendingApprovals, 1);

  // reject with reason works and writes back status
  const rejected = await run(app, defined, 'reject', userCtx(101, { collection: 'purchaseRequests', recordId: 501, reason: 'Too expensive' }));
  assert.equal(rejected.status, 'rejected');
  assert.equal(app.db.tables.purchaseRequests[0].status, 'rejected');

  // resubmit then cancel by submitter
  const r2 = await run(app, defined, 'submit', userCtx(100, { collection: 'purchaseRequests', recordId: 501 }));
  const cancelled = await run(app, defined, 'cancel', userCtx(100, { collection: 'purchaseRequests', recordId: 501 }));
  assert.equal(cancelled.status, 'cancelled');
  assert.ok(r2.id);

  // role-based resolution: create a template with role step
  const tplRole = await run(app, defined, 'createTemplate', userCtx(1, {
    name: 'Role flow',
    targetCollection: 'purchaseRequests',
    active: false,
    steps: [{ name: 'Finance', approverType: 'role', approverConfig: { roleName: 'finance' }, mode: 'sequential', completionRule: 'all' }],
  }));
  assert.ok(tplRole.id);
});

test('admin helpers: listCollections excludes plugin/system collections, searchUsers works', async () => {
  const { app, defined } = makeApp();
  const plugin = new PluginSimpleApprovalServer(app);
  await plugin.load();

  const collections = await run(app, defined, 'listCollections', userCtx(1, {}));
  assert.ok(collections.some((c) => c.name === 'purchaseRequests'));
  assert.ok(!collections.some((c) => c.name === 'approval_templates'));
  assert.ok(!collections.some((c) => c.name === 'users'));

  const roles = await run(app, defined, 'listRoles', userCtx(1, {}));
  assert.ok(roles.some((r) => r.name === 'finance'));

  const users = await run(app, defined, 'searchUsers', { ...userCtx(1, {}), query: { keyword: 'Manager' }, action: { params: { keyword: 'Manager' } } });
  assert.equal(users.length, 2);
});
