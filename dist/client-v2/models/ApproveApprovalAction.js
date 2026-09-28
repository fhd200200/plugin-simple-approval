"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActionGroups = exports.ApproveApprovalAction = void 0;
const client_v2_1 = require("@nocobase/client-v2");
const locale_1 = require("../locale");
const utils_1 = require("./utils");
class ApproveApprovalAction extends client_v2_1.ActionModel {
    constructor() {
        super(...arguments);
        this.defaultProps = {
            title: (0, locale_1.tExpr)('Approve'),
            type: 'primary',
        };
    }
}
exports.ApproveApprovalAction = ApproveApprovalAction;
ApproveApprovalAction.scene = client_v2_1.ActionSceneEnum.record;
ApproveApprovalAction.define({
    label: (0, locale_1.tExpr)('Approve'),
    sort: 2100,
    createModelOptions: {
        use: 'ApproveApprovalAction',
    },
});
ApproveApprovalAction.registerFlow({
    key: 'approveApproval',
    on: 'click',
    title: (0, locale_1.tExpr)('Approve'),
    steps: {
        doApprove: {
            async handler(ctx) {
                var _a;
                try {
                    const { record, collection } = (0, utils_1.getRecordContext)(ctx);
                    if (!record || !collection) {
                        ctx.message.error(ctx.t('Please use this action inside a record block', { ns: utils_1.ns }));
                        ctx.exit();
                        return;
                    }
                    const recordId = (0, utils_1.resolveRecordId)(ctx, record);
                    const res = await (0, utils_1.callApproval)(ctx, 'approve', { collection, recordId });
                    const data = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data;
                    if ((data === null || data === void 0 ? void 0 : data.status) === 'in_progress') {
                        ctx.message.success(ctx.t('Approved. Waiting for the next approvers.', { ns: utils_1.ns }));
                    }
                    else {
                        ctx.message.success(ctx.t('Approved', { ns: utils_1.ns }));
                    }
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
        (_b = (_a = flowEngine.getModelClass(modelName)) === null || _a === void 0 ? void 0 : _a.registerActionModels) === null || _b === void 0 ? void 0 : _b.call(_a, { ApproveApprovalAction });
    });
}
exports.registerActionGroups = registerActionGroups;
