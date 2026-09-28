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
const flow_engine_1 = require("@nocobase/flow-engine");
const locale_1 = require("../locale");
const STATUS_COLORS = {
    pending: 'orange',
    in_progress: 'processing',
    approved: 'success',
    rejected: 'error',
    returned: 'warning',
    cancelled: 'default',
};
const ACTION_COLORS = {
    submitted: 'blue',
    approved: 'green',
    rejected: 'red',
    returned: 'orange',
    cancelled: 'default',
};
function formatDate(v) {
    if (!v)
        return '';
    try {
        return new Date(v).toLocaleString();
    }
    catch {
        return String(v);
    }
}
function ReviewPage() {
    var _a, _b;
    const ctx = (0, flow_engine_1.useFlowContext)();
    const t = (0, locale_1.useT)();
    const [data, setData] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const requestId = (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.route) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.id;
    const api = ctx === null || ctx === void 0 ? void 0 : ctx.api;
    const load = (0, react_1.useCallback)(async () => {
        var _a, _b, _c, _d, _e;
        if (!api || !requestId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await api.request({ url: `approval:getRequest/${requestId}`, method: 'GET' });
            setData((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data);
        }
        catch (e) {
            antd_1.message.error(((_e = (_d = (_c = (_b = e === null || e === void 0 ? void 0 : e.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.errors) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.message) || (e === null || e === void 0 ? void 0 : e.message) || 'Failed to load request');
        }
        finally {
            setLoading(false);
        }
    }, [api, requestId]);
    (0, react_1.useEffect)(() => {
        load();
    }, [load]);
    const doAction = (action) => {
        const needsReason = action === 'reject' || action === 'return';
        const run = async (reason) => {
            var _a, _b, _c, _d;
            try {
                await api.request({
                    url: `approval:${action}/${requestId}`,
                    method: 'POST',
                    data: { reason },
                });
                antd_1.message.success(t('Done'));
                load();
            }
            catch (e) {
                antd_1.message.error(((_d = (_c = (_b = (_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) || (e === null || e === void 0 ? void 0 : e.message) || 'Failed');
            }
        };
        if (!needsReason) {
            run();
            return;
        }
        let value = '';
        antd_1.Modal.confirm({
            title: action === 'reject' ? t('Reject this request') : t('Return this request to the submitter'),
            okText: action === 'reject' ? t('Reject') : t('Return'),
            okButtonProps: action === 'reject' ? { danger: true } : undefined,
            cancelText: t('Cancel'),
            content: react_1.default.createElement(antd_1.Input.TextArea, {
                rows: 3,
                placeholder: t('Reason (required)'),
                onChange: (e) => {
                    value = e.target.value;
                },
            }),
            onOk: () => {
                if (!value.trim()) {
                    antd_1.message.warning(t('A reason is required for this action'));
                    return false;
                }
                run(value.trim());
                return undefined;
            },
        });
    };
    if (loading) {
        return (react_1.default.createElement(antd_1.Card, { style: { margin: 24 } },
            react_1.default.createElement(antd_1.Skeleton, { active: true, paragraph: { rows: 8 } })));
    }
    if (!data) {
        return (react_1.default.createElement(antd_1.Card, { style: { margin: 24 } },
            react_1.default.createElement(antd_1.Typography.Text, { type: "danger" }, t('Approval request not found. It may have been removed, or the id is invalid.'))));
    }
    const snapshotRows = Object.entries(data.snapshot || {})
        .filter(([key, value]) => value !== null && typeof value !== 'object')
        .map(([key, value]) => ({ key, field: key, value: String(value) }));
    return (react_1.default.createElement("div", { style: { padding: 24 } },
        react_1.default.createElement(antd_1.Space, { align: "center", style: { marginBottom: 16 } },
            react_1.default.createElement(antd_1.Typography.Title, { level: 3, style: { margin: 0 } }, data.requestNo),
            react_1.default.createElement(antd_1.Tag, { color: STATUS_COLORS[data.status] || 'default' }, data.status)),
        react_1.default.createElement(antd_1.Card, { title: t('Request details') },
            react_1.default.createElement(antd_1.Descriptions, { bordered: true, size: "small", column: 2, items: [
                    { key: 'template', label: t('Template'), children: data.templateName },
                    { key: 'collection', label: t('Collection'), children: data.targetCollection },
                    {
                        key: 'record',
                        label: t('Record'),
                        children: (react_1.default.createElement("a", { href: `#${data.targetCollection}/${data.targetRecordId}`, onClick: (e) => {
                                var _a, _b;
                                e.preventDefault();
                                (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.router) === null || _a === void 0 ? void 0 : _a.navigate) === null || _b === void 0 ? void 0 : _b.call(_a, `/admin/${data.targetCollection}/${data.targetRecordId}`);
                            } },
                            "#",
                            data.targetRecordId)),
                    },
                    { key: 'submittedBy', label: t('Submitted by'), children: data.submittedByName },
                    { key: 'submittedAt', label: t('Submitted at'), children: formatDate(data.submittedAt) },
                    { key: 'currentStep', label: t('Current step'), children: data.status === 'in_progress' ? `#${data.currentStep}` : '-' },
                    { key: 'completedAt', label: t('Completed at'), children: formatDate(data.completedAt) },
                    ...(data.rejectionReason
                        ? [{ key: 'rejectionReason', label: t('Rejection reason'), children: data.rejectionReason }]
                        : []),
                    ...(data.returnReason
                        ? [{ key: 'returnReason', label: t('Return reason'), children: data.returnReason }]
                        : []),
                ] }),
            ['pending', 'in_progress'].includes(data.status) && (react_1.default.createElement(antd_1.Space, { style: { marginTop: 16 }, wrap: true },
                data.canApprove && (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(antd_1.Button, { type: "primary", onClick: () => doAction('approve') }, t('Approve')),
                    react_1.default.createElement(antd_1.Button, { danger: true, onClick: () => doAction('reject') }, t('Reject')),
                    react_1.default.createElement(antd_1.Button, { onClick: () => doAction('return') }, t('Return')))),
                data.canCancel && (react_1.default.createElement(antd_1.Button, { danger: true, onClick: () => doAction('cancel') }, t('Cancel')))))),
        react_1.default.createElement(RowCards, { data: data, t: t, snapshotRows: snapshotRows })));
}
exports.default = ReviewPage;
function RowCards({ data, t, snapshotRows }) {
    return (react_1.default.createElement("div", { style: { display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' } },
        react_1.default.createElement(antd_1.Card, { title: t('Approval steps'), style: { flex: '1 1 320px', minWidth: 320 } },
            react_1.default.createElement(antd_1.Timeline, { items: (data.steps || []).map((s, index) => ({
                    color: data.status === 'approved'
                        ? 'green'
                        : s.stepOrder < data.currentStep
                            ? 'green'
                            : s.stepOrder === data.currentStep && data.status === 'in_progress'
                                ? 'blue'
                                : 'gray',
                    children: (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("b", null, `${t('Step')} ${s.stepOrder}: ${s.name}`),
                        react_1.default.createElement("br", null),
                        react_1.default.createElement(antd_1.Typography.Text, { type: "secondary" },
                            s.approverType === 'user'
                                ? t('Specific user')
                                : s.approverType === 'users'
                                    ? t('Multiple users')
                                    : t('Role'),
                            ' · ',
                            s.mode === 'parallel' ? t('Parallel') : t('Sequential'),
                            s.mode === 'parallel' ? ` · ${s.completionRule === 'any' ? t('Any one approver') : t('All approvers')}` : ''))),
                })) })),
        react_1.default.createElement(antd_1.Card, { title: t('History'), style: { flex: '1 1 320px', minWidth: 320 } },
            react_1.default.createElement(antd_1.Timeline, { items: (data.history || []).map((h, i) => ({
                    color: ACTION_COLORS[h.action] || 'gray',
                    children: (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("b", null, h.action),
                        " \u2014 ",
                        h.actorName,
                        react_1.default.createElement("br", null),
                        h.comment ? react_1.default.createElement(antd_1.Typography.Text, { type: "secondary" }, h.comment) : null,
                        react_1.default.createElement("br", null),
                        react_1.default.createElement(antd_1.Typography.Text, { type: "secondary", style: { fontSize: 12 } }, formatDate(h.createdAt)))),
                    key: i,
                })) })),
        react_1.default.createElement(antd_1.Card, { title: t('Record snapshot'), style: { flex: '1 1 100%' } },
            react_1.default.createElement(antd_1.Table, { rowKey: "key", size: "small", dataSource: snapshotRows, pagination: false, columns: [
                    { title: t('Field'), dataIndex: 'field', width: 240 },
                    { title: t('Value'), dataIndex: 'value' },
                ] }))));
}
