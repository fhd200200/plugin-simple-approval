"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@nocobase/database");
exports.default = (0, database_1.defineCollection)({
    name: 'approval_requests',
    title: '{{t("Approval Requests")}}',
    origin: '@mhd/plugin-simple-approval',
    description: 'Approval requests raised for business records',
    fields: [
        { type: 'string', name: 'requestNo', interface: 'input', allowNull: false, unique: true, index: true },
        { type: 'integer', name: 'templateId', allowNull: false, index: true },
        { type: 'integer', name: 'templateVersion', allowNull: false },
        { type: 'string', name: 'targetCollection', interface: 'input', allowNull: false, index: true },
        { type: 'string', name: 'targetRecordId', interface: 'input', allowNull: false, index: true },
        { type: 'integer', name: 'submittedBy', allowNull: false, index: true },
        { type: 'date', name: 'submittedAt', interface: 'datetime' },
        { type: 'string', name: 'status', interface: 'select', defaultValue: 'draft', index: true },
        { type: 'integer', name: 'currentStep', interface: 'input' },
        { type: 'json', name: 'currentApprovers', interface: 'json' },
        { type: 'date', name: 'completedAt', interface: 'datetime' },
        { type: 'text', name: 'rejectionReason', interface: 'textarea' },
        { type: 'text', name: 'returnReason', interface: 'textarea' },
        { type: 'integer', name: 'version', interface: 'input', defaultValue: 0 },
    ],
});
