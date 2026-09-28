"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@nocobase/client-v2");
const flow_1 = require("@nocobase/flow-engine");
class SubmitForApprovalAction extends flow_1.ActionModel {}
SubmitForApprovalAction.scene = flow_1.ActionSceneEnum.record;
class ApproveAction extends flow_1.ActionModel {}
ApproveAction.scene = flow_1.ActionSceneEnum.record;
class RejectAction extends flow_1.ActionModel {}
RejectAction.scene = flow_1.ActionSceneEnum.record;
class ReturnAction extends flow_1.ActionModel {}
ReturnAction.scene = flow_1.ActionSceneEnum.record;
class CancelApprovalAction extends flow_1.ActionModel {}
CancelApprovalAction.scene = flow_1.ActionSceneEnum.record;
class PluginSimpleApprovalClient extends client_1.Plugin {
  async load() {
    this.flowEngine.registerModelLoaders({SubmitForApprovalAction:{loader:()=>Promise.resolve({default:SubmitForApprovalAction})},ApproveAction:{loader:()=>Promise.resolve({default:ApproveAction})},RejectAction:{loader:()=>Promise.resolve({default:RejectAction})},ReturnAction:{loader:()=>Promise.resolve({default:ReturnAction})},CancelApprovalAction:{loader:()=>Promise.resolve({default:CancelApprovalAction})}});
  }
}
exports.default = PluginSimpleApprovalClient;
module.exports = PluginSimpleApprovalClient;
