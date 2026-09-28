"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@nocobase/database");
exports.default = (0, database_1.defineCollection)({
    name: 'approval_steps',
    title: '{{t("Approval Steps")}}',
    origin: '@mhd/plugin-simple-approval',
    description: 'Ordered steps of an approval template',
    fields: [
        { type: 'integer', name: 'templateId', allowNull: false, index: true },
        { type: 'string', name: 'name', interface: 'input', allowNull: false },
        { type: 'integer', name: 'stepOrder', interface: 'input', allowNull: false },
        { type: 'string', name: 'approverType', interface: 'select', allowNull: false },
        { type: 'json', name: 'approverConfig', interface: 'json', allowNull: false },
        { type: 'string', name: 'mode', interface: 'select', defaultValue: 'sequential' },
        { type: 'string', name: 'completionRule', interface: 'select', defaultValue: 'all' },
        { type: 'boolean', name: 'active', interface: 'checkbox', defaultValue: true },
    ],
});
