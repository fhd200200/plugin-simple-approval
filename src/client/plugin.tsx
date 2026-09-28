import { Plugin } from '@nocobase/client-v2';
import { ActionModel, ActionSceneEnum } from '@nocobase/flow-engine';
import { tExpr } from '@nocobase/flow-engine';
export class SubmitForApprovalAction extends ActionModel { static scene=ActionSceneEnum.record; defaultProps={children:tExpr('Submit for Approval')}; }
export class ApproveAction extends ActionModel { static scene=ActionSceneEnum.record; defaultProps={children:tExpr('Approve')}; }
export class RejectAction extends ActionModel { static scene=ActionSceneEnum.record; defaultProps={children:tExpr('Reject')}; }
export class ReturnAction extends ActionModel { static scene=ActionSceneEnum.record; defaultProps={children:tExpr('Return')}; }
export class CancelApprovalAction extends ActionModel { static scene=ActionSceneEnum.record; defaultProps={children:tExpr('Cancel')}; }
export default class PluginSimpleApprovalClient extends Plugin { async load(){ this.flowEngine.registerModelLoaders({SubmitForApprovalAction:{loader:()=>Promise.resolve({default:SubmitForApprovalAction})},ApproveAction:{loader:()=>Promise.resolve({default:ApproveAction})},RejectAction:{loader:()=>Promise.resolve({default:RejectAction})},ReturnAction:{loader:()=>Promise.resolve({default:ReturnAction})},CancelApprovalAction:{loader:()=>Promise.resolve({default:CancelApprovalAction})}}); } }
