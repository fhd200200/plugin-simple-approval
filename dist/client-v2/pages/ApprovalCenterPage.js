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
const STATUS_COLORS = {
    pending: 'orange',
    in_progress: 'processing',
    approved: 'success',
    rejected: 'error',
    returned: 'warning',
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
function ApprovalCenterPage() {
    var _a, _b, _c, _d;
    const ctx = (0, flow_engine_1.useFlowContext)();
    const t = (0, locale_1.useT)();
    const [summary, setSummary] = (0, react_1.useState)({});
    const [myApprovals, setMyApprovals] = (0, react_1.useState)([]);
    const [myRequests, setMyRequests] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const api = ctx === null || ctx === void 0 ? void 0 : ctx.api;
    const load = (0, react_1.useCallback)(async () => {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!api)
            return;
        setLoading(true);
        try {
            const [s, a, r] = await Promise.all([
                api.request({ url: 'approval:summary', method: 'GET' }),
                api.request({ url: 'approval:myApprovals', method: 'GET' }),
                api.request({ url: 'approval:myRequests', method: 'GET' }),
            ]);
            setSummary(((_a = s === null || s === void 0 ? void 0 : s.data) === null || _a === void 0 ? void 0 : _a.data) || {});
            setMyApprovals(((_b = a === null || a === void 0 ? void 0 : a.data) === null || _b === void 0 ? void 0 : _b.data) || []);
            setMyRequests(((_c = r === null || r === void 0 ? void 0 : r.data) === null || _c === void 0 ? void 0 : _c.data) || []);
        }
        catch (e) {
            antd_1.message.error(((_g = (_f = (_e = (_d = e === null || e === void 0 ? void 0 : e.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.errors) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.message) || (e === null || e === void 0 ? void 0 : e.message) || 'Failed to load data');
        }
        finally {
            setLoading(false);
        }
    }, [api]);
    (0, react_1.useEffect)(() => {
        load();
    }, [load]);
    const cancelRequest = async (row) => {
        var _a, _b, _c, _d;
        try {
            await api.request({ url: `approval:cancel/${row.id}`, method: 'POST', data: {} });
            antd_1.message.success(t('Request cancelled'));
            load();
        }
        catch (e) {
            antd_1.message.error(((_d = (_c = (_b = (_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) || (e === null || e === void 0 ? void 0 : e.message) || 'Failed');
        }
    };
    const openReview = (row) => { var _a, _b; return (_b = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.router) === null || _a === void 0 ? void 0 : _a.navigate) === null || _b === void 0 ? void 0 : _b.call(_a, `/approval/review/${row.id}`); };
    const baseColumns = [
        { title: t('Request No.'), dataIndex: 'requestNo', width: 160 },
        { title: t('Template'), dataIndex: 'templateName' },
        { title: t('Collection'), dataIndex: 'targetCollection', width: 160 },
        { title: t('Record ID'), dataIndex: 'targetRecordId', width: 100 },
        {
            title: t('Current step'),
            dataIndex: 'currentStep',
            width: 110,
            render: (v, row) => (row.status === 'in_progress' ? `#${v}` : '-'),
        },
        {
            title: t('Status'),
            dataIndex: 'status',
            width: 130,
            render: (v) => react_1.default.createElement(antd_1.Tag, { color: STATUS_COLORS[v] || 'default' }, v),
        },
        { title: t('Submitted at'), dataIndex: 'submittedAt', width: 180, render: formatDate },
    ];
    const approvalsColumns = [
        ...baseColumns,
        { title: t('Submitted by'), dataIndex: 'submittedByName', width: 140 },
        {
            title: t('Action'),
            key: 'review',
            width: 110,
            render: (_, row) => (react_1.default.createElement(antd_1.Button, { type: "primary", size: "small", onClick: () => openReview(row) }, t('Review'))),
        },
    ];
    const requestsColumns = [
        ...baseColumns,
        {
            title: t('Action'),
            key: 'actions',
            width: 170,
            render: (_, row) => (react_1.default.createElement(antd_1.Space, null,
                react_1.default.createElement(antd_1.Button, { size: "small", onClick: () => openReview(row) }, t('View')),
                ['pending', 'in_progress'].includes(row.status) && (react_1.default.createElement(antd_1.Popconfirm, { title: t('Cancel this approval request?'), onConfirm: () => cancelRequest(row), okText: t('Yes'), cancelText: t('No') },
                    react_1.default.createElement(antd_1.Button, { size: "small", danger: true }, t('Cancel')))))),
        },
    ];
    if (!api) {
        return (react_1.default.createElement(antd_1.Card, { style: { margin: 24 } },
            react_1.default.createElement(antd_1.Typography.Paragraph, null, "This page must be opened through the NocoBase router (/v/approval-center).")));
    }
    return (react_1.default.createElement("div", { style: { padding: 24 } },
        react_1.default.createElement(antd_1.Typography.Title, { level: 3 },
            react_1.default.createElement(icons_1.AuditOutlined, null),
            " ",
            t('Approval Center')),
        react_1.default.createElement(antd_1.Row, { gutter: 16 },
            react_1.default.createElement(antd_1.Col, { span: 6 },
                react_1.default.createElement(antd_1.Card, null,
                    react_1.default.createElement(antd_1.Statistic, { title: t('Pending my approval'), value: (_a = summary.pendingApprovals) !== null && _a !== void 0 ? _a : 0, prefix: react_1.default.createElement(icons_1.InboxOutlined, null) }))),
            react_1.default.createElement(antd_1.Col, { span: 6 },
                react_1.default.createElement(antd_1.Card, null,
                    react_1.default.createElement(antd_1.Statistic, { title: t('My requests (in progress)'), value: (_b = summary.inProgress) !== null && _b !== void 0 ? _b : 0, prefix: react_1.default.createElement(icons_1.FileDoneOutlined, null) }))),
            react_1.default.createElement(antd_1.Col, { span: 6 },
                react_1.default.createElement(antd_1.Card, null,
                    react_1.default.createElement(antd_1.Statistic, { title: t('Approved'), value: (_c = summary.approved) !== null && _c !== void 0 ? _c : 0, prefix: react_1.default.createElement(icons_1.CheckCircleOutlined, null) }))),
            react_1.default.createElement(antd_1.Col, { span: 6 },
                react_1.default.createElement(antd_1.Card, null,
                    react_1.default.createElement(antd_1.Statistic, { title: t('Rejected'), value: (_d = summary.rejected) !== null && _d !== void 0 ? _d : 0, prefix: react_1.default.createElement(icons_1.CloseCircleOutlined, null) })))),
        react_1.default.createElement(antd_1.Card, { style: { marginTop: 16 } },
            react_1.default.createElement(antd_1.Tabs, { items: [
                    {
                        key: 'approvals',
                        label: `${t('My Approvals')} (${myApprovals.length})`,
                        children: (react_1.default.createElement(antd_1.Table, { rowKey: "id", size: "middle", loading: loading, dataSource: myApprovals, columns: approvalsColumns, pagination: { pageSize: 10, showSizeChanger: false } })),
                    },
                    {
                        key: 'requests',
                        label: `${t('My Requests')} (${myRequests.length})`,
                        children: (react_1.default.createElement(antd_1.Table, { rowKey: "id", size: "middle", loading: loading, dataSource: myRequests, columns: requestsColumns, pagination: { pageSize: 10, showSizeChanger: false } })),
                    },
                ] }))));
}
exports.default = ApprovalCenterPage;
