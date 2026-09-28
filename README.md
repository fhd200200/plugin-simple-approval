# @mhd/plugin-simple-approval

A self-contained, workflow-independent approval engine for NocoBase Community Edition 2.2.x. It does not depend on or call `@nocobase/plugin-workflow`.

## Features

- Generic target collection and immutable template version captured per request
- Specific-user, multiple-user and role adapters (approver resolution is repository-driven)
- Sequential and parallel `all` / `any` policy fields
- Server-side submit/approve/reject/return/cancel actions, optimistic version guard, history and snapshots
- Record-level actions registered through the v2 Flow Engine
- English-ready translation keys and no business collection assumptions

See [INSTALLATION.md](INSTALLATION.md), [ADMIN_GUIDE.md](ADMIN_GUIDE.md), and [COMPATIBILITY.md](COMPATIBILITY.md).
