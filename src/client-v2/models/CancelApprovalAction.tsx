import { ActionModel, ActionSceneEnum } from '@nocobase/client-v2';
import { tExpr } from '../locale';
import { callApproval, confirmAction, getRecordContext, ns, resolveRecordId, showError } from './utils';

export class CancelApprovalAction extends ActionModel {
  static scene = ActionSceneEnum.record;

  defaultProps = {
    title: tExpr('Cancel approval'),
    danger: true,
  };
}

CancelApprovalAction.define({
  label: tExpr('Cancel approval'),
  sort: 2400,
  createModelOptions: {
    use: 'CancelApprovalAction',
  },
});

CancelApprovalAction.registerFlow({
  key: 'cancelApproval',
  on: 'click',
  title: tExpr('Cancel approval'),
  steps: {
    doCancel: {
      async handler(ctx: any) {
        try {
          const { record, collection } = getRecordContext(ctx);
          if (!record || !collection) {
            ctx.message.error(ctx.t('Please use this action inside a record block', { ns }));
            ctx.exit();
            return;
          }
          const t = (s: string) => (ctx.t ? ctx.t(s, { ns }) : s);
          const ok = await confirmAction(t('Cancel the approval request for this record?'), t);
          if (!ok) {
            ctx.exit();
            return;
          }
          const recordId = resolveRecordId(ctx, record);
          await callApproval(ctx, 'cancel', { collection, recordId });
          ctx.message.success(ctx.t('Approval request cancelled', { ns }));
        } catch (e: any) {
          showError(ctx, e);
          ctx.exit();
        }
      },
    },
  },
});

export function registerActionGroups(flowEngine: any) {
  ['RecordActionGroupModel', 'FormActionGroupModel', 'PopupSubTableFormActionGroupModel'].forEach(
    (modelName) => {
      flowEngine.getModelClass(modelName)?.registerActionModels?.({ CancelApprovalAction });
    },
  );
}
