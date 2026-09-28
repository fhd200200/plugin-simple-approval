# Installation / التثبيت — @mhd/plugin-simple-approval

## Requirements

- NocoBase **2.x** (tested against 2.2.x) with the **v2 client** (`/v` entry).
- No Workflow plugin required — the approval engine is fully self-contained.

## Option 1 — Upload through Plugin Manager (recommended)

1. Get the package file `mhd-plugin-simple-approval-1.1.0.tgz`
   (from this repository, or build it locally — see below).
2. In NocoBase, open **Plugin Manager → Upload local package** and select the `.tgz`.
3. After the plugin is added and built, **enable** it.
4. Open **Settings → Plugin settings → Simple Approval**.

> The tarball already contains the compiled server entry
> (`dist/server/index.js`) plus the v2 client build (`dist/client-v2/`), so the
> "main file dist/server/index.js not found" error does not occur.

## Option 2 — Build it yourself

```bash
git clone https://github.com/fhd200200/plugin-simple-approval.git
cd plugin-simple-approval
npm install        # installs dev dependency: typescript
npm run build      # compiles src/ -> dist/
npm test           # optional: runs engine + server tests
npm run pack       # produces mhd-plugin-simple-approval-1.1.0.tgz
```

Then upload the generated `.tgz` via Plugin Manager as above.

## Option 3 — Docker / compose

Place the folder in `packages/plugins/@mhd/plugin-simple-approval` of your
NocoBase source tree and rebuild, or mount it as a volume, then run
`yarn build` and restart the container.

## Verifying the installation

- The collections `approval_templates`, `approval_steps`, `approval_requests`,
  `approval_actions`, `approval_snapshots` are created automatically.
- **Settings → Plugin settings → Simple Approval** opens the templates page.
- `/v/approval-center` opens the Approval Center.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `main file dist/server/index.js not found` | You uploaded an old/source-only tarball. Use `mhd-plugin-simple-approval-1.1.0.tgz` which contains `dist/`. |
| Settings page is empty | Make sure you are using the **v2 client** (`/v` prefix). The plugin registers `client-v2`. |
| Buttons do nothing | The action must be used inside a block that is bound to the target collection (record scene). |
| `No active approval template is configured...` | Create/activate a template for that collection first. |
