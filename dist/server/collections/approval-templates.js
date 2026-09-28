"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@nocobase/database");
exports.default = (0, database_1.defineCollection)({
    name: 'approval_templates',
    title: '{{t("Approval Templates")}}',
    origin: '@mhd/plugin-simple-approval',
    description: 'Approval flow templates attached to a target collection',
    fields: [
        { type: 'string', name: 'name', interface: 'input', allowNull: false, unique: true },
        { type: 'text', name: 'description', interface: 'textarea' },
        { type: 'string', name: 'targetCollection', interface: 'input', allowNull: false, index: true },
        { type: 'boolean', name: 'active', interface: 'checkbox', defaultValue: false, index: true },
        { type: 'integer', name: 'version', interface: 'input', defaultValue: 1 },
        { type: 'string', name: 'statusField', interface: 'input' },
        { type: 'json', name: 'statusMapping', interface: 'json' },
        { type: 'hasMany', name: 'steps', target: 'approval_steps', foreignKey: 'templateId' },
    ],
});
