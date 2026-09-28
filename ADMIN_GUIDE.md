# Administration

Create an Approval Template with a target collection, activate it, and add ordered steps. Use `approverType: specificUser`, `role`, or `multipleUsers`; configurations are JSON and are resolved by the server repository adapter. Set `mode` to `sequential` or `parallel`, and `completionRule` to `all` or `any`.

The server owns status, current step, approvers, actor, history, and version fields. Do not expose those fields for ordinary CRUD editing. Configure the five record actions in a record action bar. A reject or return request must contain a reason.

This release deliberately omits escalation, delegation, SLA, conditional rules, email, and manager resolution.
