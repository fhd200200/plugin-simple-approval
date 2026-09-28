"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@nocobase/database");
exports.default = (0, database_1.defineCollection)({
    name: 'approval_snapshots',
    title: '{{t("Approval Snapshots")}}',
    origin: '@mhd/plugin-simple-approval',
    description: 'Snapshot of the business record at submission time',
    fields: [
        { type: 'integer', name: 'requestId', unique: true },
        { type: 'json', name: 'snapshotData', interface: 'json' },
        { type: 'date', name: 'createdAt', interface: 'datetime' },
    ],
});
