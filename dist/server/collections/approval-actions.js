"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@nocobase/database");
exports.default = (0, database_1.defineCollection)({
    name: 'approval_actions',
    title: '{{t("Approval Actions")}}',
    origin: '@mhd/plugin-simple-approval',
    description: 'Audit trail of every action taken on an approval request',
    fields: [
        { type: 'integer', name: 'requestId', allowNull: false, index: true },
        { type: 'integer', name: 'stepId', index: true },
        { type: 'integer', name: 'actorId', allowNull: false, index: true },
        { type: 'string', name: 'action', interface: 'select', allowNull: false },
        { type: 'text', name: 'comment', interface: 'textarea' },
        { type: 'date', name: 'createdAt', interface: 'datetime' },
    ],
});
