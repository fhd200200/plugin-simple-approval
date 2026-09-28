# Simple Approval — @mhd/plugin-simple-approval

**محرك موافقات متعدد الخطوات لـ NocoBase 2.x — بدون أي اعتماد على Workflow.**
A multi-step approval engine for NocoBase 2.x — fully independent of the Workflow plugin.

## What you get / ما تحصل عليه

| Page / الصفحة | Where / المكان |
| --- | --- |
| **Approval Templates + How to use (settings)** | Settings → Plugin settings → **Simple Approval** |
| **Approval Center** (dashboard, My Approvals, My Requests) | `/approval-center` (default UI) — `/v/approval-center` (v2 UI) |
| **Review page** (approve / reject / return, timeline, snapshot) | `/approval/review/:id` |
| **Record buttons** | "Configure actions" on any table/block: `Submit for approval`, `Approve`, `Reject`, `Return`, `Cancel approval` |

## Features

- **Approval templates** bound to any business collection (one *active* template per collection).
- **Steps**: specific user, multiple users, or a **role**.
- **Modes**: sequential, or parallel with *All approvers* / *Any one approver* completion rules.
- **Actions**: Approve, Reject (reason required), Return to submitter (reason required), Cancel (submitter or admin).
- **History timeline** of every action + **record snapshot** at submission time.
- **Status write-back**: optionally map submit/approve/reject/return/cancel to a status field on the business record.
- Works on **both UI entries**: the default client (no `/v`) **and** the v2 client (`/v`). No Workflow dependency.

## Install

Build the package and upload it through **Plugin Manager → Upload local package** (see [INSTALLATION.md](INSTALLATION.md)), or:

```bash
npm pack --ignore-scripts
# then upload mhd-plugin-simple-approval-1.3.0.tgz in NocoBase Plugin Manager
```

## Quick start / البداية السريعة

1. Enable the plugin.
2. **Settings → Plugin settings → Simple Approval → Approval Templates → New template**.
3. Choose the target collection (e.g. *Purchase Requests*), add steps (user / users / role), save, activate.
4. Open any block of that collection → **Configure actions** → add **Submit for approval**.
5. Approvers work from `/v/approval-center` (My Approvals → Review) or add Approve/Reject/Return buttons to the block.

Full guide: [USAGE.md](USAGE.md) · Admin reference: [ADMIN_GUIDE.md](ADMIN_GUIDE.md)

## REST API (server resource `approval`)

| Action | Who | Purpose |
| --- | --- | --- |
| `approval:submit` | logged in | Submit a record (`{ collection, recordId }`) |
| `approval:approve|reject|return|cancel` | approver / submitter | Act on the open request of a record |
| `approval:summary`, `myApprovals`, `myRequests`, `getRequest` | logged in | Dashboard data |
| `approval:recordRequests` | logged in | Requests of one record |
| `approval:listTemplates/createTemplate/updateTemplate/destroyTemplate` | admin | Template CRUD |
| `approval:listCollections`, `listRoles`, `searchUsers`, `allRequests` | admin | Builder helpers |

## Development

```bash
npm install       # typescript only
npm run build     # tsc -> dist/
npm test          # engine + server + client bundle tests (16 tests)
npm run pack      # build the .tgz
```

## License

MIT
