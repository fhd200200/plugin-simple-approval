/**
 * Tests for the two client UMD bundles.
 * Simulates exactly how the NocoBase browser loads plugin code:
 * the v1 lane and the v2 lane both use requirejs (AMD) with the host
 * application providing the framework dependencies (defineGlobalDeps).
 *
 * Run: node --test test/client-bundles.test.js
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

/** Stub modules the host application would provide. */
function stubComponent(name) {
  const fn = () => null;
  fn.displayName = name;
  return fn;
}

function makeProxyStub(extra = {}) {
  const base = {
    ...extra,
  };
  return new Proxy(base, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === '__esModule') return true;
      return stubComponent(String(prop));
    },
  });
}

function makeReactStub() {
  return {
    __esModule: true,
    createElement: (...args) => ({ type: args[0], props: args[2] || null }),
    Fragment: 'Fragment',
    useState: (v) => [v, () => {}],
    useEffect: () => {},
    useCallback: (fn) => fn,
    useMemo: (fn) => fn(),
    useRef: (v) => ({ current: v }),
  };
}

/** Execute a UMD bundle through a fake AMD (requirejs) environment. */
function loadViaAmd(bundlePath, depStubs, expectedName) {
  const code = fs.readFileSync(bundlePath, 'utf8');
  let amdName = null;
  let amdDeps = null;
  let resolved = null;
  const fakeDefine = (...args) => {
    // Official NocoBase bundles use NAMED defines:
    //   define("@scope/pkg", [deps], factory)
    assert.equal(typeof args[0], 'string', 'define() must be named (official format)');
    amdName = args[0];
    const deps = Array.isArray(args[1]) ? args[1] : [];
    const factory = Array.isArray(args[1]) ? args[2] : args[1];
    amdDeps = deps;
    const args2 = deps.map((name) => depStubs[name]);
    resolved = factory(...args2);
  };
  fakeDefine.amd = true;
  // Fresh context = browser-like: no CommonJS `module`/`exports`,
  // so the UMD shell takes the AMD (requirejs) branch.
  vm.runInNewContext(code, {
    define: fakeDefine,
    self: { React: makeReactStub() },
  });
  assert.ok(amdDeps, 'AMD define() was not called');
  if (expectedName) {
    assert.equal(amdName, expectedName, 'AMD module name must match the loader module id');
  }
  return { module: resolved, amdDeps, amdName };
}

// ---------------------------------------------------------------------------
// v1 lane (default UI, no /v)
// ---------------------------------------------------------------------------
test('v1 bundle loads via AMD and registers settings page, routes, scopes and initializers', async () => {
  const calls = {
    settings: [],
    routes: [],
    scopes: null,
    initializers: [],
  };
  const app = {
    pluginSettingsManager: {
      add: (key, opts) => calls.settings.push({ key, opts }),
    },
    router: {
      add: (name, opts) => calls.routes.push({ name, opts }),
    },
    addScopes: (scopes) => {
      calls.scopes = scopes;
    },
    schemaInitializerManager: {
      addItem: (initializer, key, item) => calls.initializers.push({ initializer, key, item }),
    },
  };

  const clientStub = {
    __esModule: true,
    Plugin: class {
      constructor(a) {
        this.app = a;
      }
      t(s) {
        return s;
      }
    },
    useAPIClient: () => ({ request: async () => ({ data: { data: [] } }), resource: () => ({}) }),
    useRecord: () => ({}),
    useCollection: () => ({ name: 'x', filterTargetKey: 'id' }),
    useResourceActionContext: () => ({ refresh: () => {} }),
    useSchemaInitializer: () => ({ insert: () => {} }),
  };

  const depStubs = {
    react: makeReactStub(),
    'react-router-dom': {
      __esModule: true,
      useNavigate: () => () => {},
      useParams: () => ({ id: '1' }),
    },
    antd: makeProxyStub({
      message: { success: () => {}, error: () => {}, warning: () => {} },
      Modal: { confirm: () => {} },
    }),
    '@ant-design/icons': makeProxyStub(),
    '@nocobase/client': clientStub,
  };

  const { module: m, amdDeps } = loadViaAmd(
    path.join(__dirname, '../dist/client/index.js'),
    depStubs,
    '@mhd/plugin-simple-approval',
  );

  // AMD deps must all be provided by the v1 host (defineGlobalDeps)
  assert.ok(!amdDeps.includes('require'), 'deps must not contain require (official format)');
  for (const dep of amdDeps) {
    assert.ok(depStubs[dep], `stub missing for AMD dep: ${dep}`);
  }

  // The plugin class must be exported as default
  assert.equal(typeof m.default, 'function', 'exports.default must be the plugin class');
  assert.equal(m.default.name, 'PluginSimpleApprovalClient', 'class name');

  // Instantiate + load()
  const plugin = new m.default(app);
  await plugin.load();

  // Settings page registered
  assert.equal(calls.settings.length, 1);
  assert.equal(calls.settings[0].key, 'simple-approval');
  assert.equal(typeof calls.settings[0].opts.Component, 'function');
  assert.equal(calls.settings[0].opts.icon, 'AuditOutlined');

  // Approval center + review routes
  const routeNames = calls.routes.map((r) => r.name);
  assert.deepEqual(routeNames.sort(), ['approval-center', 'approval-review']);
  assert.ok(calls.routes.every((r) => typeof r.opts.Component === 'function'));

  // Action scopes
  assert.ok(calls.scopes);
  for (const scope of [
    'useSubmitForApprovalActionProps',
    'useApproveApprovalActionProps',
    'useRejectApprovalActionProps',
    'useReturnApprovalActionProps',
    'useCancelApprovalActionProps',
  ]) {
    assert.equal(typeof calls.scopes[scope], 'function', `scope ${scope}`);
  }

  // Initializer items for table + details
  assert.ok(calls.initializers.length >= 10, 'initializer items registered');
  assert.ok(calls.initializers.every((i) => i.item && typeof i.item.useComponentProps === 'function'));
});

// ---------------------------------------------------------------------------
// v2 lane (/v entry)
// ---------------------------------------------------------------------------
test('v2 bundle loads via AMD and registers settings menu, routes and model loaders', async () => {
  const calls = {
    menuItems: [],
    pageTabs: [],
    routes: [],
    modelLoaders: null,
  };
  const app = {
    pluginSettingsManager: {
      addMenuItem: (opts) => calls.menuItems.push(opts),
      addPageTabItem: (opts) => calls.pageTabs.push(opts),
    },
    router: {
      add: (name, opts) => calls.routes.push({ name, opts }),
    },
    flowEngine: {
      registerModelLoaders: (loaders) => {
        calls.modelLoaders = loaders;
      },
      getModelClass: (name) => ({
        registerActionModels: () => {},
      }),
    },
  };

  const clientV2Stub = {
    __esModule: true,
    Plugin: class {
      constructor(a) {
        this.app = a;
        // Mirrors the real Plugin base class (BaseApplication wiring)
        this.pluginSettingsManager = a.pluginSettingsManager;
        this.router = a.router;
        this.flowEngine = a.flowEngine;
      }
      t(s) {
        return s;
      }
    },
    ActionModel: class {
      static define() {}
      static registerFlow() {}
    },
    ActionSceneEnum: { collection: 'collection', record: 'record', both: 'both', all: 'all' },
  };

  const flowEngineStub = {
    __esModule: true,
    ActionModel: class {},
    ActionSceneEnum: { collection: 'collection', record: 'record', both: 'both', all: 'all' },
    tExpr: (key) => key,
    useFlowEngine: () => ({ context: { t: (s) => s } }),
  };

  const depStubs = {
    react: makeReactStub(),
    antd: makeProxyStub({
      message: { success: () => {}, error: () => {}, warning: () => {} },
      Modal: { confirm: () => {} },
    }),
    '@ant-design/icons': makeProxyStub(),
    '@nocobase/client-v2': clientV2Stub,
    '@nocobase/flow-engine': flowEngineStub,
  };

  const { module: m, amdDeps } = loadViaAmd(
    path.join(__dirname, '../dist/client-v2/index.js'),
    depStubs,
    '@mhd/plugin-simple-approval/client-v2',
  );

  assert.ok(!amdDeps.includes('require'), 'deps must not contain require (official format)');
  for (const dep of amdDeps) {
    assert.ok(depStubs[dep], `stub missing for AMD dep: ${dep}`);
  }

  assert.equal(typeof m.default, 'function', 'exports.default must be the plugin class');
  assert.equal(m.default.name, 'PluginSimpleApprovalClientV2', 'class name');

  const plugin = new m.default(app);
  await plugin.load();

  assert.equal(calls.menuItems.length, 1);
  assert.equal(calls.menuItems[0].key, 'simple-approval');
  assert.equal(calls.pageTabs.length, 2, 'templates + guide tabs');
  assert.ok(calls.pageTabs.every((t) => typeof t.componentLoader === 'function'));

  assert.deepEqual(calls.routes.map((r) => r.name).sort(), ['approval-center', 'approval-review']);
  assert.ok(calls.routes.every((r) => typeof r.opts.componentLoader === 'function'));

  // Model loaders for the 5 action buttons
  const loaders = Object.keys(calls.modelLoaders || {});
  assert.deepEqual(
    loaders.sort(),
    [
      'ApproveApprovalAction',
      'CancelApprovalAction',
      'RejectApprovalAction',
      'ReturnApprovalAction',
      'SubmitForApprovalAction',
    ].sort(),
  );
  for (const key of loaders) {
    const loader = calls.modelLoaders[key].loader;
    assert.equal(typeof loader, 'function', `loader ${key}`);
    // The loader resolves the model class itself (official pattern)
    const modelClass = await loader();
    assert.equal(typeof modelClass, 'function', `loader ${key} resolves a model class`);
  }
});

test('root client shims point to the built bundles', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const main = pkg.main.replace('./', '');
  assert.ok(fs.existsSync(path.join(__dirname, '..', main)), 'server entry exists');
  for (const f of ['client.js', 'client-v2.js', 'server.js']) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', f)), `${f} marker exists`);
  }
  const clientShim = fs.readFileSync(path.join(__dirname, '../client.js'), 'utf8');
  assert.ok(clientShim.includes('dist/client/index.js'), 'client.js requires dist/client/index.js');
  const clientV2Shim = fs.readFileSync(path.join(__dirname, '../client-v2.js'), 'utf8');
  assert.ok(clientV2Shim.includes('dist/client-v2/index.js'), 'client-v2.js requires dist/client-v2/index.js');
});
