"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useT = exports.tExpr = exports.NAMESPACE = void 0;
const flow_engine_1 = require("@nocobase/flow-engine");
exports.NAMESPACE = '@mhd/plugin-simple-approval';
/** Translate a static string (used in FlowModel definitions). */
function tExpr(key) {
    return (0, flow_engine_1.tExpr)(key, { ns: [exports.NAMESPACE, 'client'] });
}
exports.tExpr = tExpr;
/** Translation hook for React components. */
function useT() {
    const engine = (0, flow_engine_1.useFlowEngine)();
    return (str) => { var _a, _b, _c; return (_c = (_b = (_a = engine === null || engine === void 0 ? void 0 : engine.context) === null || _a === void 0 ? void 0 : _a.t) === null || _b === void 0 ? void 0 : _b.call(_a, str, { ns: [exports.NAMESPACE, 'client'] })) !== null && _c !== void 0 ? _c : str; };
}
exports.useT = useT;
