# Compatibility — @mhd/plugin-simple-approval

| Item | Status |
| --- | --- |
| NocoBase 2.2.x | ✅ Primary target (server + `client-v2` / `/v` entry) |
| NocoBase 1.x | ❌ Not supported (the plugin registers `client-v2` only) |
| Workflow plugin | ✅ Not required — fully independent engine |
| Database | Any database supported by NocoBase (collections use standard field types: string, text, integer, boolean, json, date) |

## Package layout (matches official 2.x plugins)

```
server.js            -> dist/server/index.js          (Node, CJS)
client.js            -> dist/client/index.js          (default UI, UMD/AMD)
client-v2.js         -> dist/client-v2/index.js       (/v UI, UMD/AMD)
server.d.ts / client.d.ts / client-v2.d.ts
src/
  index.ts
  server/            plugin.ts, collections/, services/approval-engine.ts
  client/            plugin.tsx, actions.tsx, pages/          (v1 UI)
  client-v2/         plugin.tsx, locale.ts, models/, pages/   (v2 UI)
  locale/            en-US.json
dist/                compiled output (shipped in the tarball)
build-client.cjs     esbuild-based UMD build for both client lanes
```

Both client bundles are **UMD** (CommonJS / AMD / globals) with all framework
dependencies externalized — exactly like the official NocoBase plugin packages
(the browser loads them via requirejs with dependencies provided by the host
application).

`package.json` → `"main": "./dist/server/index.js"` and peer dependencies on
`@nocobase/server`, `@nocobase/database`, `@nocobase/client-v2`,
`@nocobase/flow-engine` (all `2.x`).

## Client APIs used (v1 lane — default UI)

- `pluginSettingsManager.add(key, { title, icon, Component, sort })`
- `app.router.add(name, { path, Component })`
- `app.addScopes` + `schemaInitializerManager.addItem('table:configureActions' | 'details:configureActions', ...)`
- `useAPIClient`, `useRecord`, `useCollection`, `useResourceActionContext`, `useSchemaInitializer`
- `ISchema`-style action schema (`x-component: 'Action'` + `x-use-component-props`)

## Client APIs used (v2 lane — /v UI)

- `pluginSettingsManager.addMenuItem` / `addPageTabItem` (settings page)
- `router.add` with `componentLoader` (Approval Center + Review routes)
- `flowEngine.registerModelLoaders` with `extends: 'ActionModel'` + `registerActionModels`
  on `RecordActionGroupModel` / `FormActionGroupModel` / `PopupSubTableFormActionGroupModel`
- `ActionModel`, `ActionSceneEnum`, `registerFlow` (`on: 'click'`), `tExpr`
- `useFlowContext` (`ctx.api`, `ctx.router`, `ctx.route.params`), `useFlowEngine`

## Server APIs used

- `defineCollection` from `@nocobase/database` (per-file default exports under `src/server/collections`)
- `app.resourceManager.define({ name: 'approval', actions })`
- `app.acl.allow(resource, actions, 'loggedIn' | admin condition)`
- Repositories via `app.db.getRepository(...)` with `transaction` support
