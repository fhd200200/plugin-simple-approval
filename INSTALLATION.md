# Installation

1. Build with the NocoBase 2.2.x plugin toolchain (the package intentionally does not vendor NocoBase).
2. Upload `@mhd/plugin-simple-approval-1.0.0.tgz` in **Plugin manager → Upload**.
3. Enable the plugin and run the normal NocoBase upgrade command so the five system collections are synchronized.
4. Grant the plugin permissions to administrators and approvers.

No Workflow plugin is required. Existing business collections are never altered automatically.

## Upgrade

Install the newer package, run the host's normal upgrade command, then enable it. Requests store template version and remain independent of later template edits.
