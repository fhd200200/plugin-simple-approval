"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ns = exports.confirmAction = exports.promptForReason = exports.showError = exports.callApproval = exports.resolveRecordId = exports.getRecordContext = void 0;
const react_1 = __importDefault(require("react"));
const antd_1 = require("antd");
const locale_1 = require("../locale");
/** Extract the current record + collection from a flow action context. */
function getRecordContext(ctx) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const record = (_f = (_c = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.record) !== null && _a !== void 0 ? _a : (typeof ((_b = ctx === null || ctx === void 0 ? void 0 : ctx.blockModel) === null || _b === void 0 ? void 0 : _b.getCurrentRecord) === 'function' ? ctx.blockModel.getCurrentRecord() : null)) !== null && _c !== void 0 ? _c : (_e = (_d = ctx === null || ctx === void 0 ? void 0 : ctx.model) === null || _d === void 0 ? void 0 : _d.context) === null || _e === void 0 ? void 0 : _e.record) !== null && _f !== void 0 ? _f : null;
    const collection = (_p = (_l = (_h = (_g = ctx === null || ctx === void 0 ? void 0 : ctx.collection) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : (_k = (_j = ctx === null || ctx === void 0 ? void 0 : ctx.blockModel) === null || _j === void 0 ? void 0 : _j.collection) === null || _k === void 0 ? void 0 : _k.name) !== null && _l !== void 0 ? _l : (_o = (_m = ctx === null || ctx === void 0 ? void 0 : ctx.model) === null || _m === void 0 ? void 0 : _m.collection) === null || _o === void 0 ? void 0 : _o.name) !== null && _p !== void 0 ? _p : null;
    return { record, collection };
}
exports.getRecordContext = getRecordContext;
/** Resolve the primary key value of a record. */
function resolveRecordId(ctx, record) {
    var _a, _b, _c, _d;
    if (record == null)
        return null;
    if (record.id != null)
        return record.id;
    const viaTk = (_b = (typeof ((_a = ctx === null || ctx === void 0 ? void 0 : ctx.collection) === null || _a === void 0 ? void 0 : _a.getFilterByTK) === 'function' && ctx.collection.getFilterByTK(record))) !== null && _b !== void 0 ? _b : (typeof ((_d = (_c = ctx === null || ctx === void 0 ? void 0 : ctx.model) === null || _c === void 0 ? void 0 : _c.collection) === null || _d === void 0 ? void 0 : _d.getFilterByTK) === 'function' && ctx.model.collection.getFilterByTK(record));
    return viaTk !== null && viaTk !== void 0 ? viaTk : null;
}
exports.resolveRecordId = resolveRecordId;
/** POST /api/approval:<action>[/<id>] */
function callApproval(ctx, action, data, id) {
    const url = id != null ? `approval:${action}/${id}` : `approval:${action}`;
    return ctx.api.request({ url, method: 'POST', data: data || {} });
}
exports.callApproval = callApproval;
/** Show an error coming from the API in a friendly way. */
function showError(ctx, e) {
    var _a, _b, _c, _d, _e, _f;
    const text = ((_d = (_c = (_b = (_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) ||
        ((_f = (_e = e === null || e === void 0 ? void 0 : e.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.error) ||
        (e === null || e === void 0 ? void 0 : e.message) ||
        'Request failed';
    try {
        ctx.message.error(ctx.t ? ctx.t(String(text)) : String(text));
    }
    catch {
        antd_1.message.error(String(text));
    }
}
exports.showError = showError;
/** Prompt the user for a mandatory reason. Resolves null when cancelled. */
function promptForReason(title, okText, t) {
    return new Promise((resolve) => {
        let value = '';
        antd_1.Modal.confirm({
            title,
            okText,
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
                resolve(value.trim());
                return undefined;
            },
            onCancel: () => resolve(null),
        });
    });
}
exports.promptForReason = promptForReason;
/** Simple confirm dialog. Resolves false when cancelled. */
function confirmAction(title, t) {
    return new Promise((resolve) => {
        antd_1.Modal.confirm({
            title,
            okText: t('OK'),
            cancelText: t('Cancel'),
            onOk: () => {
                resolve(true);
                return undefined;
            },
            onCancel: () => resolve(false),
        });
    });
}
exports.confirmAction = confirmAction;
exports.ns = locale_1.NAMESPACE;
