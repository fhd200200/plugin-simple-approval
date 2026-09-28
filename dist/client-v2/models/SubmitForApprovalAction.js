"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActionGroups = exports.SubmitForApprovalAction = void 0;
const client_v2_1 = require("@nocobase/client-v2");
const locale_1 = require("../locale");
const utils_1 = require("./utils");
class SubmitForApprovalAction extends client_v2_1.ActionModel {
    constructor() {
        super(...arguments);
        this.defaultProps = {
            title: (0, locale_1.tExpr)('Submit for approval'),
        };
    }
}
exports.SubmitForApprovalAction = SubmitForApprovalAction;
SubmitForApprovalAction.scene = client_v2_1.ActionSceneEnum.record;
SubmitForApprovalAction.define({
    label: (0, locale_1.tExpr)('Submit for approval'),
    sort: 2000,
    createModelOptions: {
        use: 'SubmitForApprovalAction',
    },
});
SubmitForApprovalAction.registerFlow({
    key: 'submitForApproval',
    on: 'click',
    title: (0, locale_1.tExpr)('Submit for approval'),
    steps: {
        doSubmit: {
            async handler(ctx) {
                try {
                    const { record, collection } = (0, utils_1.getRecordContext)(ctx);
                    if (!record || !collection) {
                        ctx.message.error(ctx.t('Please use this action inside a record block', { ns: utils_1.ns }));
                        ctx.exit();
                        return;
                    }
                    const recordId = (0, utils_1.resolveRecordId)(ctx, record);
                    await (0, utils_1.callApproval)(ctx, 'submit', { collection, recordId });
                    ctx.message.success(ctx.t('Submitted for approval', { ns: utils_1.ns }));
                }
                catch (e) {
                    (0, utils_1.showError)(ctx, e);
                    ctx.exit();
                }
            },
        },
    },
});
/** Make the action available in the "Configure actions" menus. */
function registerActionGroups(flowEngine) {
    ['RecordActionGroupModel', 'FormActionGroupModel', 'PopupSubTableFormActionGroupModel'].forEach((modelName) => {
        var _a, _b;
        (_b = (_a = flowEngine.getModelClass(modelName)) === null || _a === void 0 ? void 0 : _a.registerActionModels) === null || _b === void 0 ? void 0 : _b.call(_a, { SubmitForApprovalAction });
    });
}
exports.registerActionGroups = registerActionGroups;
