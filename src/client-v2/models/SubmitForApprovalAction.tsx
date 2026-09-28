import { ActionModel, ActionSceneEnum } from '@nocobase/client-v2';
import { tExpr } from '../locale';
import { callApproval, getRecordContext, ns, resolveRecordId, showError } from './utils';

export class SubmitForApprovalAction extends ActionModel {
  static scene = ActionSceneEnum.record;

  defaultProps = {
    title: tExpr('Submit for approval'),
  };
}

SubmitForApprovalAction.define({
  label: tExpr('Submit for approval'),
  sort: 2000,
  createModelOptions: {
    use: 'SubmitForApprovalAction',
  },
});

SubmitForApprovalAction.registerFlow({
  key: 'submitForApproval',
  on: 'click',
  title: tExpr('Submit for approval'),
  steps: {
    doSubmit: {
      async handler(ctx: any) {
        try {
          const { record, collection } = getRecordContext(ctx);
          if (!record || !collection) {
            ctx.message.error(ctx.t('Please use this action inside a record block', { ns }));
            ctx.exit();
            return;
          }
          const recordId = resolveRecordId(ctx, record);
          await callApproval(ctx, 'submit', { collection, recordId });
          ctx.message.success(ctx.t('Submitted for approval', { ns }));
        } catch (e: any) {
          showError(ctx, e);
          ctx.exit();
        }
      },
    },
  },
});

/** Make the action available in the "Configure actions" menus. */
export function registerActionGroups(flowEngine: any) {
  ['RecordActionGroupModel', 'FormActionGroupModel', 'PopupSubTableFormActionGroupModel'].forEach(
    (modelName) => {
      flowEngine.getModelClass(modelName)?.registerActionModels?.({ SubmitForApprovalAction });
    },
  );
}
