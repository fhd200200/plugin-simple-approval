"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@nocobase/server");
class PluginSimpleApprovalServer extends server_1.Plugin {
  async beforeLoad() { this.app.logger.info('[simple-approval] loading independent approval engine'); }
  async load() { this.app.logger.info('[simple-approval] Approval engine loaded (no Workflow dependency)'); }
}
exports.default = PluginSimpleApprovalServer;
module.exports = PluginSimpleApprovalServer;
