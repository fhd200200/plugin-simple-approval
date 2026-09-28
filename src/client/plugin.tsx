import React from 'react';
import { Plugin } from '@nocobase/client';
import SettingsPage from './pages/SettingsPage';
import ApprovalCenterPage from './pages/ApprovalCenterPage';
import ReviewPage from './pages/ReviewPage';
import {
  approvalActionInitializerItems,
  useApproveApprovalActionProps,
  useCancelApprovalActionProps,
  useRejectApprovalActionProps,
  useReturnApprovalActionProps,
  useSubmitForApprovalActionProps,
} from './actions';

/**
 * v1 client plugin (default UI entry, without /v).
 * Registered automatically when the package contains client.js + dist/client/index.js.
 */
export class PluginSimpleApprovalClient extends Plugin {
  async load() {
    // Settings → Plugin settings → Simple Approval
    this.app.pluginSettingsManager.add('simple-approval', {
      title: this.app.i18n ? this.t('Simple Approval') : 'Simple Approval',
      icon: 'AuditOutlined',
      Component: SettingsPage,
      sort: 300,
    });

    // Standalone pages
    this.app.router.add('approval-center', {
      path: '/approval-center',
      Component: ApprovalCenterPage,
    });
    this.app.router.add('approval-review', {
      path: '/approval/review/:id',
      Component: ReviewPage,
    });

    // Record action buttons ("Configure actions" of tables / details blocks)
    this.app.addScopes({
      useSubmitForApprovalActionProps,
      useApproveApprovalActionProps,
      useRejectApprovalActionProps,
      useReturnApprovalActionProps,
      useCancelApprovalActionProps,
    });

    for (const [key, item] of Object.entries(approvalActionInitializerItems)) {
      for (const initializer of ['table:configureActions', 'details:configureActions']) {
        try {
          this.app.schemaInitializerManager.addItem(initializer, key, item);
        } catch (e) {
          // Initializer not present in this build; skip silently.
        }
      }
    }
  }
}

export default PluginSimpleApprovalClient;
