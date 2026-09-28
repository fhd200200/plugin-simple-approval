"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActionGroups = exports.RejectApprovalAction = void 0;
const client_v2_1 = require("@nocobase/client-v2");
const locale_1 = require("../locale");
const utils_1 = require("./utils");
class RejectApprovalAction extends client_v2_1.ActionModel {
    constructor() {
        super(...arguments);
        this.defaultProps = {
            title: (0, locale_1.tExpr)('Reject'),
            danger: true,
        };
    }
}
exports.RejectApprovalAction = RejectApprovalAction;
RejectApprovalAction.scene = client_v2_1.ActionSceneEnum.record;
RejectApprovalAction.define({
    label: (0, locale_1.tExpr)('Reject'),
    sort: 2200,
    createModelOptions: {
        use: 'RejectApprovalAction',
    },
});
RejectApprovalAction.registerFlow({
    key: 'rejectApproval',
    on: 'click',
    title: (0, locale_1.tExpr)('Reject'),
    steps: {
        doReject: {
            async handler(ctx) {
                try {
                    const { record, collection } = (0, utils_1.getRecordContext)(ctx);
                    if (!record || !collection) {
                        ctx.message.error(ctx.t('Please use this action inside a record block', { ns: utils_1.ns }));
                        ctx.exit();
                        return;
                    }
                    const t = (s) => (ctx.t ? ctx.t(s, { ns: utils_1.ns }) : s);
                    const reason = await (0, utils_1.promptForReason)(t('Reject this request'), t('Reject'), t);
                    if (reason == null) {
                        ctx.exit();
                        return;
                    }
                    const recordId = (0, utils_1.resolveRecordId)(ctx, record);
                    await (0, utils_1.callApproval)(ctx, 'reject', { collection, recordId, reason });
                    ctx.message.success(ctx.t('Rejected', { ns: utils_1.ns }));
                }
                catch (e) {
                    (0, utils_1.showError)(ctx, e);
                    ctx.exit();
                }
            },
        },
    },
});
function registerActionGroups(flowEngine) {
    ['RecordActionGroupModel', 'FormActionGroupModel', 'PopupSubTableFormActionGroupModel'].forEach((modelName) => {
        var _a, _b;
        (_b = (_a = flowEngine.getModelClass(modelName)) === null || _a === void 0 ? void 0 : _a.registerActionModels) === null || _b === void 0 ? void 0 : _b.call(_a, { RejectApprovalAction });
    });
}
exports.registerActionGroups = registerActionGroups;
