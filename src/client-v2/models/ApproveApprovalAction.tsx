import { ActionModel, ActionSceneEnum } from '@nocobase/client-v2';
import { tExpr } from '../locale';
import { callApproval, getRecordContext, ns, resolveRecordId, showError } from './utils';

export class ApproveApprovalAction extends ActionModel {
  static scene = ActionSceneEnum.record;

  defaultProps = {
    title: tExpr('Approve'),
    type: 'primary',
  };
}

ApproveApprovalAction.define({
  label: tExpr('Approve'),
  sort: 2100,
  createModelOptions: {
    use: 'ApproveApprovalAction',
  },
});

ApproveApprovalAction.registerFlow({
  key: 'approveApproval',
  on: 'click',
  title: tExpr('Approve'),
  steps: {
    doApprove: {
      async handler(ctx: any) {
        try {
          const { record, collection } = getRecordContext(ctx);
          if (!record || !collection) {
            ctx.message.error(ctx.t('Please use this action inside a record block', { ns }));
            ctx.exit();
            return;
          }
          const recordId = resolveRecordId(ctx, record);
          const res = await callApproval(ctx, 'approve', { collection, recordId });
          const data = res?.data?.data;
          if (data?.status === 'in_progress') {
            ctx.message.success(ctx.t('Approved. Waiting for the next approvers.', { ns }));
          } else {
            ctx.message.success(ctx.t('Approved', { ns }));
          }
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
      flowEngine.getModelClass(modelName)?.registerActionModels?.({ ApproveApprovalAction });
    },
  );
}
