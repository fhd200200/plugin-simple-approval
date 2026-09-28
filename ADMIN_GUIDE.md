# Admin Guide — Simple Approval

## Collections created automatically

| Collection | Purpose |
| --- | --- |
| `approval_templates` | One row per template: name, target collection, status field/mapping, active, version |
| `approval_steps` | Steps of each template with order, approver type/config, mode, completion rule |
| `approval_requests` | The requests: request no, status, current step + approvers, reasons, timestamps |
| `approval_actions` | Audit trail of every action (submitted/approved/rejected/returned/cancelled) |
| `approval_snapshots` | JSON snapshot of the business record at submission time |

Admins can build NocoBase blocks on these collections like on any other collection.

## Permissions

- **User actions** (`submit`, `approve`, `reject`, `return`, `cancel`, `summary`, `myApprovals`,
  `myRequests`, `getRequest`, `recordRequests`) are allowed for **any signed-in user**;
  row-level rules are enforced by the engine:
  - approve/reject/return → only current-step approvers,
  - cancel → submitter or administrator,
  - reject/return → a reason is mandatory.
- **Admin actions** (`listTemplates`, `createTemplate`, `updateTemplate`, `destroyTemplate`,
  `listCollections`, `listRoles`, `searchUsers`, `allRequests`) require the **admin** role.

## One active template per collection

When you activate a template for a collection, other templates of the same
collection are deactivated automatically. Editing a template's steps bumps its
version and replaces its steps; existing requests keep running with their own
recorded flow (they reference the request row + steps history).

Deleting a template is blocked while it has requests in progress.

## Status write-back (optional)

In the template editor set:

- `Status field` — the field on the target collection to update (e.g. `status`).
- Values per event: `On submit`, `On approved`, `On rejected`, `On returned`, `On cancelled`.

Example mapping: submit → `pending`, approved → `approved`, rejected → `rejected`,
returned/cancelled → `draft`.

## Monitoring

- **Approval Center** (`/v/approval-center`) — personal dashboard.
- `approval:allRequests` (admin) — full list; the plugin settings page can be extended
  with a table block on `approval_requests` if you want an admin dashboard in the UI.
- Server logs are prefixed with `[simple-approval]`.

## Housekeeping

- Requests are small rows; the only growing parts are `approval_actions` (audit) and
  `approval_snapshots` (one per request). Archive/delete old terminal requests if needed.
- After a **reject** or **return**, the record can be submitted again — a new request is
  created (the old one stays for audit).
