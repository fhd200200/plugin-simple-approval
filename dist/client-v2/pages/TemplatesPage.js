"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const antd_1 = require("antd");
const icons_1 = require("@ant-design/icons");
const flow_engine_1 = require("@nocobase/flow-engine");
const locale_1 = require("../locale");
const APPROVER_TYPES = [
    { value: 'user', label: 'Specific user' },
    { value: 'users', label: 'Multiple users' },
    { value: 'role', label: 'Role' },
];
const MODES = [
    { value: 'sequential', label: 'Sequential' },
    { value: 'parallel', label: 'Parallel' },
];
const COMPLETION_RULES = [
    { value: 'all', label: 'All approvers must approve' },
    { value: 'any', label: 'Any one approver is enough' },
];
const STATUS_EVENTS = [
    { key: 'submitted', label: 'On submit' },
    { key: 'approved', label: 'On approved' },
    { key: 'rejected', label: 'On rejected' },
    { key: 'returned', label: 'On returned' },
    { key: 'cancelled', label: 'On cancelled' },
];
function newStep() {
    return { name: '', approverType: 'user', approverConfig: {}, mode: 'sequential', completionRule: 'all' };
}
/** User picker that searches the approval:searchUsers endpoint. */
function UserSelect({ multiple, value, onChange, api, placeholder }) {
    const [options, setOptions] = (0, react_1.useState)([]);
    const search = (0, react_1.useCallback)(async (keyword) => {
        var _a;
        try {
            const res = await api.request({
                url: 'approval:searchUsers',
                method: 'GET',
                params: { keyword: keyword || '' },
            });
            setOptions((((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) || []).map((u) => ({ value: u.id, label: u.label })));
        }
        catch {
            setOptions([]);
        }
    }, [api]);
    (0, react_1.useEffect)(() => {
        search('');
    }, [search]);
    return (react_1.default.createElement(antd_1.Select, { mode: multiple ? 'multiple' : undefined, showSearch: true, allowClear: true, style: { width: '100%' }, placeholder: placeholder, value: value, onChange: onChange, onSearch: (kw) => search(kw), filterOption: false, options: options }));
}
function StepEditor({ step, index, onChange, onRemove, api, roles, t }) {
    var _a, _b, _c;
    const approverType = step.approverType;
    return (react_1.default.createElement(antd_1.Card, { size: "small", title: `${t('Step')} ${index + 1}`, extra: react_1.default.createElement("a", { onClick: onRemove }, t('Remove')) },
        react_1.default.createElement(antd_1.Row, { gutter: 12 },
            react_1.default.createElement(antd_1.Col, { span: 12 },
                react_1.default.createElement(antd_1.Typography.Text, { type: "secondary" }, t('Step name')),
                react_1.default.createElement(antd_1.Input, { style: { marginTop: 4 }, value: step.name, placeholder: t('e.g. Manager review'), onChange: (e) => onChange({ ...step, name: e.target.value }) })),
            react_1.default.createElement(antd_1.Col, { span: 12 },
                react_1.default.createElement(antd_1.Typography.Text, { type: "secondary" }, t('Approver type')),
                react_1.default.createElement(antd_1.Select, { style: { width: '100%', marginTop: 4 }, value: step.approverType, options: APPROVER_TYPES.map((o) => ({ ...o, label: t(o.label) })), onChange: (v) => onChange({ ...step, approverType: v, approverConfig: {} }) }))),
        react_1.default.createElement("div", { style: { marginTop: 12 } },
            approverType === 'user' && (react_1.default.createElement(UserSelect, { api: api, placeholder: t('Select the approver'), value: (_a = step.approverConfig) === null || _a === void 0 ? void 0 : _a.userId, onChange: (v) => onChange({ ...step, approverConfig: { ...step.approverConfig, userId: v } }) })),
            approverType === 'users' && (react_1.default.createElement(UserSelect, { api: api, multiple: true, placeholder: t('Select the approvers'), value: (_b = step.approverConfig) === null || _b === void 0 ? void 0 : _b.userIds, onChange: (v) => onChange({ ...step, approverConfig: { ...step.approverConfig, userIds: v } }) })),
            approverType === 'role' && (react_1.default.createElement(antd_1.Select, { style: { width: '100%' }, showSearch: true, allowClear: true, placeholder: t('Select a role'), value: (_c = step.approverConfig) === null || _c === void 0 ? void 0 : _c.roleName, onChange: (v) => onChange({ ...step, approverConfig: { ...step.approverConfig, roleName: v } }), options: roles.map((r) => ({ value: r.name, label: r.title || r.name })) }))),
        react_1.default.createElement(antd_1.Row, { gutter: 12, style: { marginTop: 12 } },
            react_1.default.createElement(antd_1.Col, { span: 12 },
                react_1.default.createElement(antd_1.Typography.Text, { type: "secondary" }, t('Mode')),
                react_1.default.createElement(antd_1.Select, { style: { width: '100%', marginTop: 4 }, value: step.mode, options: MODES.map((o) => ({ ...o, label: t(o.label) })), onChange: (v) => onChange({ ...step, mode: v }) })),
            react_1.default.createElement(antd_1.Col, { span: 12 },
                react_1.default.createElement(antd_1.Typography.Text, { type: "secondary" }, t('Completion rule')),
                react_1.default.createElement(antd_1.Select, { style: { width: '100%', marginTop: 4 }, value: step.completionRule, options: COMPLETION_RULES.map((o) => ({ ...o, label: t(o.label) })), onChange: (v) => onChange({ ...step, completionRule: v }) })))));
}
function TemplateModal({ open, template, onClose, onSaved, api, collections, roles, t }) {
    const [form] = antd_1.Form.useForm();
    const [steps, setSteps] = (0, react_1.useState)([newStep()]);
    const [saving, setSaving] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (open) {
            if (template) {
                form.setFieldsValue({
                    name: template.name,
                    description: template.description,
                    targetCollection: template.targetCollection,
                    active: template.active,
                    statusField: template.statusField,
                    statusMapping: template.statusMapping || {},
                });
                setSteps((template.steps || []).map((s) => ({
                    name: s.name,
                    approverType: s.approverType,
                    approverConfig: s.approverConfig || {},
                    mode: s.mode || 'sequential',
                    completionRule: s.completionRule || 'all',
                })));
            }
            else {
                form.resetFields();
                form.setFieldsValue({ active: true });
                setSteps([newStep()]);
            }
        }
    }, [open, template, form]);
    const save = async (values) => {
        var _a, _b, _c, _d;
        if (!steps.length) {
            antd_1.message.warning(t('Add at least one step'));
            return;
        }
        for (const s of steps) {
            if (!s.name.trim()) {
                antd_1.message.warning(t('Every step needs a name'));
                return;
            }
        }
        setSaving(true);
        try {
            const payload = { ...values, steps };
            if (template) {
                await api.request({ url: `approval:updateTemplate/${template.id}`, method: 'POST', data: payload });
            }
            else {
                await api.request({ url: 'approval:createTemplate', method: 'POST', data: payload });
            }
            antd_1.message.success(t('Template saved'));
            onSaved();
            onClose();
        }
        catch (e) {
            antd_1.message.error(((_d = (_c = (_b = (_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) || (e === null || e === void 0 ? void 0 : e.message) || 'Failed');
        }
        finally {
            setSaving(false);
        }
    };
    return (react_1.default.createElement(antd_1.Modal, { open: open, title: template ? `${t('Edit template')}: ${template.name}` : t('New approval template'), onCancel: onClose, onOk: () => form.submit(), okText: t('Save'), cancelText: t('Cancel'), confirmLoading: saving, width: 760, destroyOnClose: true },
        react_1.default.createElement(antd_1.Form, { form: form, layout: "vertical", onFinish: save },
            react_1.default.createElement(antd_1.Row, { gutter: 12 },
                react_1.default.createElement(antd_1.Col, { span: 12 },
                    react_1.default.createElement(antd_1.Form.Item, { name: "name", label: t('Template name'), rules: [{ required: true }] },
                        react_1.default.createElement(antd_1.Input, { placeholder: "Purchase request approval" }))),
                react_1.default.createElement(antd_1.Col, { span: 12 },
                    react_1.default.createElement(antd_1.Form.Item, { name: "targetCollection", label: t('Target collection'), rules: [{ required: true }] },
                        react_1.default.createElement(antd_1.Select, { showSearch: true, allowClear: true, options: collections.map((c) => ({ value: c.name, label: `${c.title} (${c.name})` })) })))),
            react_1.default.createElement(antd_1.Form.Item, { name: "description", label: t('Description') },
                react_1.default.createElement(antd_1.Input.TextArea, { rows: 2 })),
            react_1.default.createElement(antd_1.Card, { size: "small", title: t('Write status back to the record (optional)'), style: { marginBottom: 16 } },
                react_1.default.createElement(antd_1.Form.Item, { name: "statusField", label: t('Status field on the target collection'), tooltip: t('Optional. When set, the plugin writes the mapped values below into this field of the business record.') },
                    react_1.default.createElement(antd_1.Input, { placeholder: "status" })),
                react_1.default.createElement(antd_1.Row, { gutter: 8 }, STATUS_EVENTS.map((event) => (react_1.default.createElement(antd_1.Col, { span: 8, key: event.key },
                    react_1.default.createElement(antd_1.Form.Item, { name: ['statusMapping', event.key], label: t(event.label), initialValue: "" },
                        react_1.default.createElement(antd_1.Input, { placeholder: "e.g. pending" }))))))),
            react_1.default.createElement(antd_1.Typography.Title, { level: 5 }, t('Approval steps')),
            react_1.default.createElement(antd_1.Space, { direction: "vertical", style: { width: '100%' }, size: 12 }, steps.map((step, index) => (react_1.default.createElement(StepEditor, { key: index, step: step, index: index, api: api, roles: roles, t: t, onChange: (updated) => setSteps(steps.map((s, i) => (i === index ? updated : s))), onRemove: () => setSteps(steps.filter((_, i) => i !== index)) })))),
            react_1.default.createElement(antd_1.Button, { block: true, type: "dashed", icon: react_1.default.createElement(icons_1.PlusOutlined, null), style: { marginTop: 12 }, onClick: () => setSteps([...steps, newStep()]) }, t('Add step')),
            react_1.default.createElement(antd_1.Form.Item, { name: "active", label: t('Active'), valuePropName: "checked", style: { marginTop: 16 } },
                react_1.default.createElement(antd_1.Switch, null)),
            react_1.default.createElement(antd_1.Typography.Text, { type: "secondary" }, t('Only one active template is used per collection. Activating this one deactivates the others.')))));
}
function TemplatesPage() {
    const ctx = (0, flow_engine_1.useFlowContext)();
    const t = (0, locale_1.useT)();
    const api = ctx === null || ctx === void 0 ? void 0 : ctx.api;
    const [templates, setTemplates] = (0, react_1.useState)([]);
    const [collections, setCollections] = (0, react_1.useState)([]);
    const [roles, setRoles] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [modalOpen, setModalOpen] = (0, react_1.useState)(false);
    const [editing, setEditing] = (0, react_1.useState)(null);
    const load = (0, react_1.useCallback)(async () => {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!api)
            return;
        setLoading(true);
        try {
            const [tpl, cols, rls] = await Promise.all([
                api.request({ url: 'approval:listTemplates', method: 'GET' }),
                api.request({ url: 'approval:listCollections', method: 'GET' }),
                api.request({ url: 'approval:listRoles', method: 'GET' }),
            ]);
            setTemplates(((_a = tpl === null || tpl === void 0 ? void 0 : tpl.data) === null || _a === void 0 ? void 0 : _a.data) || []);
            setCollections(((_b = cols === null || cols === void 0 ? void 0 : cols.data) === null || _b === void 0 ? void 0 : _b.data) || []);
            setRoles(((_c = rls === null || rls === void 0 ? void 0 : rls.data) === null || _c === void 0 ? void 0 : _c.data) || []);
        }
        catch (e) {
            antd_1.message.error(((_g = (_f = (_e = (_d = e === null || e === void 0 ? void 0 : e.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.errors) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.message) || (e === null || e === void 0 ? void 0 : e.message) || 'Failed to load');
        }
        finally {
            setLoading(false);
        }
    }, [api]);
    (0, react_1.useEffect)(() => {
        load();
    }, [load]);
    const toggleActive = async (row) => {
        var _a, _b, _c, _d;
        try {
            await api.request({
                url: `approval:updateTemplate/${row.id}`,
                method: 'POST',
                data: { active: !row.active },
            });
            load();
        }
        catch (e) {
            antd_1.message.error(((_d = (_c = (_b = (_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) || (e === null || e === void 0 ? void 0 : e.message) || 'Failed');
        }
    };
    const remove = async (row) => {
        var _a, _b, _c, _d;
        try {
            await api.request({ url: `approval:destroyTemplate/${row.id}`, method: 'POST', data: {} });
            antd_1.message.success(t('Template deleted'));
            load();
        }
        catch (e) {
            antd_1.message.error(((_d = (_c = (_b = (_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) || (e === null || e === void 0 ? void 0 : e.message) || 'Failed');
        }
    };
    if (!api) {
        return (react_1.default.createElement(antd_1.Card, { style: { margin: 24 } },
            react_1.default.createElement(antd_1.Typography.Paragraph, null, "This page must be opened through the NocoBase settings router.")));
    }
    const columns = [
        { title: t('Name'), dataIndex: 'name' },
        { title: t('Target collection'), dataIndex: 'targetCollection' },
        { title: t('Steps'), dataIndex: 'steps', width: 90, render: (v) => (v || []).length },
        { title: t('Version'), dataIndex: 'version', width: 90 },
        {
            title: t('Active'),
            dataIndex: 'active',
            width: 100,
            render: (v, row) => react_1.default.createElement(antd_1.Switch, { checked: v, onChange: () => toggleActive(row) }),
        },
        {
            title: t('Actions'),
            key: 'actions',
            width: 140,
            render: (_, row) => (react_1.default.createElement(antd_1.Space, null,
                react_1.default.createElement(antd_1.Button, { size: "small", icon: react_1.default.createElement(icons_1.EditOutlined, null), onClick: () => {
                        setEditing(row);
                        setModalOpen(true);
                    } }),
                react_1.default.createElement(antd_1.Popconfirm, { title: t('Delete this template?'), onConfirm: () => remove(row), okText: t('Yes'), cancelText: t('No') },
                    react_1.default.createElement(antd_1.Button, { size: "small", danger: true, icon: react_1.default.createElement(icons_1.DeleteOutlined, null) })))),
        },
    ];
    return (react_1.default.createElement("div", { style: { padding: 24 } },
        react_1.default.createElement(antd_1.Tabs, { items: [
                {
                    key: 'templates',
                    label: t('Approval Templates'),
                    children: (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement(antd_1.Button, { type: "primary", icon: react_1.default.createElement(icons_1.PlusOutlined, null), style: { marginBottom: 16 }, onClick: () => {
                                setEditing(null);
                                setModalOpen(true);
                            } }, t('New template')),
                        react_1.default.createElement(antd_1.Table, { rowKey: "id", size: "middle", loading: loading, dataSource: templates, columns: columns, locale: {
                                emptyText: (react_1.default.createElement(antd_1.Empty, { description: t('No templates yet. Create your first approval template.') })),
                            }, pagination: false }))),
                },
            ] }),
        react_1.default.createElement(TemplateModal, { open: modalOpen, template: editing, api: api, collections: collections, roles: roles, t: t, onClose: () => setModalOpen(false), onSaved: load })));
}
exports.default = TemplatesPage;
