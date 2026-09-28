import { ActionModel, ActionSceneEnum } from '@nocobase/client-v2';
import { tExpr } from '../locale';
import { callApproval, getRecordContext, ns, promptForReason, resolveRecordId, showError } from './utils';

export class RejectApprovalAction extends ActionModel {
  static scene = ActionSceneEnum.record;

  defaultProps = {
    title: tExpr('Reject'),
    danger: true,
  };
}

RejectApprovalAction.define({
  label: tExpr('Reject'),
  sort: 2200,
  createModelOptions: {
    use: 'RejectApprovalAction',
  },
});

RejectApprovalAction.registerFlow({
  key: 'rejectApproval',
  on: 'click',
  title: tExpr('Reject'),
  steps: {
    doReject: {
      async handler(ctx: any) {
        try {
          const { record, collection } = getRecordContext(ctx);
          if (!record || !collection) {
            ctx.message.error(ctx.t('Please use this action inside a record block', { ns }));
            ctx.exit();
            return;
          }
          const t = (s: string) => (ctx.t ? ctx.t(s, { ns }) : s);
          const reason = await promptForReason(t('Reject this request'), t('Reject'), t);
          if (reason == null) {
            ctx.exit();
            return;
          }
          const recordId = resolveRecordId(ctx, record);
          await callApproval(ctx, 'reject', { collection, recordId, reason });
          ctx.message.success(ctx.t('Rejected', { ns }));
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
      flowEngine.getModelClass(modelName)?.registerActionModels?.({ RejectApprovalAction });
    },
  );
}
