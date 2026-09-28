/**
 * In-memory unit tests for the approval engine.
 * Run: node --test test/engine.test.js
 */
const test = require('node:test');
const assert = require('node:assert');
const { ApprovalEngine, ApprovalError } = require('../dist/server/services/approval-engine');

function makeRepo(seed = {}) {
  const store = {
    templates: seed.templates || [],
    steps: seed.steps || [],
    requests: seed.requests || [],
    actions: seed.actions || [],
    snapshots: [],
    targetRecords: seed.targetRecords || {},
    users: seed.users || [],
    idSeq: { requests: 1, actions: 1, snapshots: 1 },
  };

  const matches = (row, filter) => {
    if (!filter) return true;
    if (filter.$or) return filter.$or.some((f) => matches(row, f));
    return Object.entries(filter).every(([key, expected]) => {
      if (key === '$or') return true;
      if (key.includes('.')) {
        const [field, op] = key.split('.');
        if (op === '$in') return expected.includes(row[field]);
        if (op === '$includes') return String(row[field]).includes(expected);
      }
      return row[key] === expected;
    });
  };

  const repo = {
    store,
    async transaction(fn) {
      return fn({});
    },
    async getTemplate(id) {
      return store.templates.find((t) => t.id === id) || null;
    },
    async getSteps(templateId) {
      return store.steps.filter((s) => s.templateId === templateId);
    },
    async resolveApprovers(step) {
      const cfg = step.approverConfig || {};
      if (step.approverType === 'user') return cfg.userId ? [cfg.userId] : [];
      if (step.approverType === 'users') return cfg.userIds || [];
      if (step.approverType === 'role') return (store.users || [])
        .filter((u) => (u.roles || []).includes(cfg.roleName))
        .map((u) => u.id);
      return [];
    },
    async createRequest(values) {
      const row = { id: store.idSeq.requests++, ...values };
      store.requests.push(row);
      return row;
    },
    async getRequest(id) {
      return store.requests.find((r) => r.id === Number(id)) || null;
    },
    async findOpenRequest(collection, recordId) {
      return (
        store.requests.find(
          (r) =>
            r.targetCollection === collection &&
            r.targetRecordId === String(recordId) &&
            ['pending', 'in_progress'].includes(r.status),
        ) || null
      );
    },
    async updateRequest(id, patch) {
      const row = store.requests.find((r) => r.id === Number(id));
      Object.assign(row, patch);
    },
    async addAction(data) {
      store.actions.push({ id: store.idSeq.actions++, createdAt: new Date(), ...data });
    },
    async countStepApproverApprovals(requestId, stepId) {
      const actors = new Set(
        store.actions
          .filter((a) => a.requestId === Number(requestId) && a.stepId === stepId && a.action === 'approved')
          .map((a) => a.actorId),
      );
      return actors.size;
    },
    async snapshot(requestId, data) {
      store.snapshots.push({ id: store.idSeq.snapshots++, requestId, snapshotData: data });
    },
    async nextRequestNo() {
      return `APR-${String(store.idSeq.requests).padStart(6, '0')}`;
    },
    async updateTargetRecord(collection, recordId, values) {
      const key = `${collection}#${recordId}`;
      store.targetRecords[key] = { ...(store.targetRecords[key] || {}), ...values };
    },
  };
  return repo;
}

const TEMPLATE = { id: 1, name: 'Purchase approval', version: 3, statusField: 'status', statusMapping: { submitted: 'pending', approved: 'approved', rejected: 'rejected', returned: 'draft', cancelled: 'draft' } };

const SEQ_STEPS = [
  { id: 11, templateId: 1, name: 'Manager', stepOrder: 1, approverType: 'user', approverConfig: { userId: 101 }, mode: 'sequential', completionRule: 'all', active: true },
  { id: 12, templateId: 1, name: 'Finance', stepOrder: 2, approverType: 'users', approverConfig: { userIds: [201, 202] }, mode: 'parallel', completionRule: 'all', active: true },
  { id: 13, templateId: 1, name: 'GM (any)', stepOrder: 3, approverType: 'users', approverConfig: { userIds: [301, 302] }, mode: 'parallel', completionRule: 'any', active: true },
];

async function submitNew(repo, recordId = '501', userId = 100) {
  repo.store.steps = SEQ_STEPS;
  repo.store.templates = [TEMPLATE];
  return new ApprovalEngine(repo).submit({
    template: TEMPLATE,
    steps: SEQ_STEPS,
    targetCollection: 'purchaseRequests',
    targetRecordId: recordId,
    userId,
    snapshot: { id: recordId, title: 'Laptop', amount: 5000 },
  });
}

test('sequential flow: submit -> step1 -> parallel-all -> parallel-any -> approved', async () => {
  const repo = makeRepo();
  const engine = new ApprovalEngine(repo);

  const req = await submitNew(repo);
  assert.equal(req.status, 'in_progress');
  assert.equal(req.currentStep, 1);
  assert.deepEqual(req.currentApprovers, [101]);
  assert.equal(repo.store.targetRecords['purchaseRequests#501'].status, 'pending');

  // Step 1 approved by 101 -> moves to step 2 with both users
  let r = await engine.act({ requestId: req.id, actorId: 101, action: 'approved' });
  assert.equal(r.status, 'in_progress');
  assert.equal(r.currentStep, 2);
  assert.deepEqual(r.currentApprovers, [201, 202]);

  // First approval in "all" parallel step: stays on step 2
  r = await engine.act({ requestId: req.id, actorId: 201, action: 'approved' });
  assert.equal(r.currentStep, 2);
  assert.equal(r.status, 'in_progress');

  // Second approval completes step 2 -> step 3
  r = await engine.act({ requestId: req.id, actorId: 202, action: 'approved' });
  assert.equal(r.currentStep, 3);
  assert.deepEqual(r.currentApprovers, [301, 302]);

  // "any" rule: one approval is enough -> final approval
  r = await engine.act({ requestId: req.id, actorId: 302, action: 'approved' });
  assert.equal(r.status, 'approved');
  assert.ok(r.completedAt);
  assert.equal(repo.store.targetRecords['purchaseRequests#501'].status, 'approved');

  // Acting again fails: already processed
  await assert.rejects(
    () => engine.act({ requestId: req.id, actorId: 302, action: 'approved' }),
    (e) => e instanceof ApprovalError && e.code === 'PROCESSED',
  );
});

test('authorization: only current-step approvers may act', async () => {
  const repo = makeRepo();
  const engine = new ApprovalEngine(repo);
  const req = await submitNew(repo);

  await assert.rejects(
    () => engine.act({ requestId: req.id, actorId: 999, action: 'approved' }),
    (e) => e instanceof ApprovalError && e.code === 'UNAUTHORIZED',
  );
  // A step-2 approver cannot act while on step 1
  await assert.rejects(
    () => engine.act({ requestId: req.id, actorId: 201, action: 'approved' }),
    (e) => e instanceof ApprovalError && e.code === 'UNAUTHORIZED',
  );
});

test('reject requires a reason and closes the request', async () => {
  const repo = makeRepo();
  const engine = new ApprovalEngine(repo);
  const req = await submitNew(repo);

  await assert.rejects(
    () => engine.act({ requestId: req.id, actorId: 101, action: 'rejected', comment: '  ' }),
    (e) => e instanceof ApprovalError && e.code === 'REASON_REQUIRED',
  );

  const r = await engine.act({ requestId: req.id, actorId: 101, action: 'rejected', comment: 'Budget exceeded' });
  assert.equal(r.status, 'rejected');
  assert.equal(r.rejectionReason, 'Budget exceeded');
  assert.deepEqual(r.currentApprovers, []);
  assert.equal(repo.store.targetRecords['purchaseRequests#501'].status, 'rejected');
});

test('return sends the request back to the submitter', async () => {
  const repo = makeRepo();
  const engine = new ApprovalEngine(repo);
  const req = await submitNew(repo);

  const r = await engine.act({ requestId: req.id, actorId: 101, action: 'returned', comment: 'Add vendor quote' });
  assert.equal(r.status, 'returned');
  assert.equal(r.returnReason, 'Add vendor quote');
  assert.equal(repo.store.targetRecords['purchaseRequests#501'].status, 'draft');

  // After returning, the record can be submitted again as a new request
  const req2 = await submitNew(repo);
  assert.notEqual(req2.id, req.id);
  assert.equal(req2.status, 'in_progress');
});

test('double submit is blocked while a request is open', async () => {
  const repo = makeRepo();
  await submitNew(repo);
  await assert.rejects(
    () => submitNew(repo),
    (e) => e instanceof ApprovalError && e.code === 'OPEN_REQUEST',
  );
});

test('cancel: submitter only (admin may also cancel)', async () => {
  const repo = makeRepo();
  const engine = new ApprovalEngine(repo);
  const req = await submitNew(repo);

  await assert.rejects(
    () => engine.act({ requestId: req.id, actorId: 201, action: 'cancelled' }),
    (e) => e instanceof ApprovalError && e.code === 'UNAUTHORIZED',
  );

  const r = await engine.act({ requestId: req.id, actorId: 100, action: 'cancelled', comment: 'not needed' });
  assert.equal(r.status, 'cancelled');

  const req2 = await submitNew(repo, '502');
  const r2 = await engine.act({ requestId: req2.id, actorId: 555, action: 'cancelled', isAdmin: true });
  assert.equal(r2.status, 'cancelled');
});

test('role-based approver resolution', async () => {
  const repo = makeRepo({ users: [
    { id: 1, roles: ['member'] },
    { id: 2, roles: ['manager', 'member'] },
    { id: 3, roles: ['manager'] },
  ] });
  const engine = new ApprovalEngine(repo);
  const roleSteps = [
    { id: 21, templateId: 2, name: 'Managers', stepOrder: 1, approverType: 'role', approverConfig: { roleName: 'manager' }, mode: 'parallel', completionRule: 'any', active: true },
  ];
  repo.store.steps = roleSteps;
  repo.store.templates = [{ id: 2, name: 'Role flow', version: 1 }];
  const req = await engine.submit({
    template: { id: 2, name: 'Role flow', version: 1 },
    steps: roleSteps,
    targetCollection: 'orders',
    targetRecordId: '7',
    userId: 1,
    snapshot: { id: 7 },
  });
  assert.deepEqual(req.currentApprovers, [2, 3]);
  const r = await engine.act({ requestId: req.id, actorId: 3, action: 'approved' });
  assert.equal(r.status, 'approved');
});

test('inactive steps are skipped', async () => {
  const repo = makeRepo();
  const engine = new ApprovalEngine(repo);
  const skipSteps = [
    { id: 31, templateId: 3, name: 'A', stepOrder: 1, approverType: 'user', approverConfig: { userId: 1 }, mode: 'sequential', completionRule: 'all', active: true },
    { id: 32, templateId: 3, name: 'B (disabled)', stepOrder: 2, approverType: 'user', approverConfig: { userId: 2 }, mode: 'sequential', completionRule: 'all', active: false },
    { id: 33, templateId: 3, name: 'C', stepOrder: 3, approverType: 'user', approverConfig: { userId: 3 }, mode: 'sequential', completionRule: 'all', active: true },
  ];
  repo.store.steps = skipSteps;
  repo.store.templates = [{ id: 3, name: 'Skip', version: 1 }];
  const req = await engine.submit({
    template: { id: 3, name: 'Skip', version: 1 },
    steps: skipSteps,
    targetCollection: 'orders',
    targetRecordId: '9',
    userId: 10,
    snapshot: { id: 9 },
  });
  await engine.act({ requestId: req.id, actorId: 1, action: 'approved' });
  const r = await repo.getRequest(req.id);
  assert.equal(r.currentStep, 3);
  assert.deepEqual(r.currentApprovers, [3]);
  const final = await engine.act({ requestId: req.id, actorId: 3, action: 'approved' });
  assert.equal(final.status, 'approved');
});

test('no approver configured -> clear error', async () => {
  const repo = makeRepo();
  const engine = new ApprovalEngine(repo);
  await assert.rejects(
    () =>
      engine.submit({
        template: { id: 4, name: 'Broken', version: 1 },
        steps: [{ id: 41, templateId: 4, name: 'Nobody', stepOrder: 1, approverType: 'user', approverConfig: {}, mode: 'sequential', completionRule: 'all', active: true }],
        targetCollection: 'orders',
        targetRecordId: '1',
        userId: 10,
        snapshot: { id: 1 },
      }),
    (e) => e instanceof ApprovalError && e.code === 'NO_APPROVER',
  );
});
