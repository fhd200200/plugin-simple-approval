# Compatibility decisions

Target: NocoBase Community Edition 2.2.x.

- Server entry extends `Plugin` from `@nocobase/server`; lifecycle registration is done in `beforeLoad`/`load`.
- System collections use `defineCollection()` in `src/server/collections`, which NocoBase discovers before `load()`.
- Client actions extend `ActionModel`, use `ActionSceneEnum.record`, and are registered with `flowEngine.registerModelLoaders`, matching the v2 client documentation.
- REST handlers use `resourceManager.define()` when available; the engine itself is independent of REST and Workflow.
- The plugin declares 2.2.x peer ranges and does not include Workflow packages.

The exact host application's database adapter remains responsible for role lookup and notifications; adapters must implement those through NocoBase APIs rather than direct SQL.
