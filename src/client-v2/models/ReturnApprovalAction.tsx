import { ActionModel, ActionSceneEnum } from '@nocobase/client-v2';
import { tExpr } from '../locale';
import { callApproval, getRecordContext, ns, promptForReason, resolveRecordId, showError } from './utils';

export class ReturnApprovalAction extends ActionModel {
  static scene = ActionSceneEnum.record;

  defaultProps = {
    title: tExpr('Return'),
  };
}

ReturnApprovalAction.define({
  label: tExpr('Return'),
  sort: 2300,
  createModelOptions: {
    use: 'ReturnApprovalAction',
  },
});

ReturnApprovalAction.registerFlow({
  key: 'returnApproval',
  on: 'click',
  title: tExpr('Return'),
  steps: {
    doReturn: {
      async handler(ctx: any) {
        try {
          const { record, collection } = getRecordContext(ctx);
          if (!record || !collection) {
            ctx.message.error(ctx.t('Please use this action inside a record block', { ns }));
            ctx.exit();
            return;
          }
          const t = (s: string) => (ctx.t ? ctx.t(s, { ns }) : s);
          const reason = await promptForReason(t('Return this request to the submitter'), t('Return'), t);
          if (reason == null) {
            ctx.exit();
            return;
          }
          const recordId = resolveRecordId(ctx, record);
          await callApproval(ctx, 'return', { collection, recordId, reason });
          ctx.message.success(ctx.t('Returned to the submitter', { ns }));
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
      flowEngine.getModelClass(modelName)?.registerActionModels?.({ ReturnApprovalAction });
    },
  );
}
