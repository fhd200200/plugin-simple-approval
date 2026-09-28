import React from 'react';
import { Application, Plugin } from '@nocobase/client-v2';

export class PluginSimpleApprovalClientV2 extends Plugin<any, Application> {
  async load() {
    // ------------------------------------------------------------------
    // Plugin settings pages (Settings -> Plugin settings -> Simple Approval)
    // ------------------------------------------------------------------
    this.pluginSettingsManager.addMenuItem({
      key: 'simple-approval',
      title: this.t('Simple Approval'),
      icon: 'AuditOutlined',
      sort: 300,
    });

    this.pluginSettingsManager.addPageTabItem({
      menuKey: 'simple-approval',
      key: 'index',
      title: this.t('Approval Templates'),
      componentLoader: () => import('./pages/TemplatesPage'),
    });

    this.pluginSettingsManager.addPageTabItem({
      menuKey: 'simple-approval',
      key: 'guide',
      title: this.t('How to use'),
      componentLoader: () => import('./pages/GuidePage'),
    });

    // ------------------------------------------------------------------
    // Main pages (served under the /v entry point)
    // ------------------------------------------------------------------
    this.router.add('approval-center', {
      path: '/approval-center',
      componentLoader: () => import('./pages/ApprovalCenterPage'),
    });

    this.router.add('approval-review', {
      path: '/approval/review/:id',
      componentLoader: () => import('./pages/ReviewPage'),
    });

    // ------------------------------------------------------------------
    // Record action buttons ("Configure actions" in any table/block)
    // ------------------------------------------------------------------
    const registerGroups = (module: any) => {
      try {
        module?.registerActionGroups?.(this.app.flowEngine);
      } catch (e) {
        // Non fatal: the buttons only become unavailable in the config menu.
      }
    };

    this.app.flowEngine.registerModelLoaders({
      SubmitForApprovalAction: {
        extends: 'ActionModel',
        loader: async () => {
          const module = await import('./models/SubmitForApprovalAction');
          registerGroups(module);
          return module.SubmitForApprovalAction;
        },
      },
      ApproveApprovalAction: {
        extends: 'ActionModel',
        loader: async () => {
          const module = await import('./models/ApproveApprovalAction');
          registerGroups(module);
          return module.ApproveApprovalAction;
        },
      },
      RejectApprovalAction: {
        extends: 'ActionModel',
        loader: async () => {
          const module = await import('./models/RejectApprovalAction');
          registerGroups(module);
          return module.RejectApprovalAction;
        },
      },
      ReturnApprovalAction: {
        extends: 'ActionModel',
        loader: async () => {
          const module = await import('./models/ReturnApprovalAction');
          registerGroups(module);
          return module.ReturnApprovalAction;
        },
      },
      CancelApprovalAction: {
        extends: 'ActionModel',
        loader: async () => {
          const module = await import('./models/CancelApprovalAction');
          registerGroups(module);
          return module.CancelApprovalAction;
        },
      },
    });
  }
}

export default PluginSimpleApprovalClientV2;
