import React from 'react';
import { Input, Modal, message } from 'antd';
import { useAPIClient, useCollection, useRecord, useResourceActionContext } from '@nocobase/client';

/** Resolve the primary key of the current record. */
function getRecordId(record: any, collection: any): any {
  if (record == null) return null;
  const key = collection?.filterTargetKey || collection?.primaryKey || 'id';
  return record[key] ?? record.id ?? null;
}

function errorText(e: any): string {
  return (
    e?.response?.data?.errors?.[0]?.message ||
    e?.response?.data?.error?.message ||
    e?.message ||
    'Request failed'
  );
}

function promptForReason(title: string, okText: string): Promise<string | null> {
  return new Promise((resolve) => {
    let value = '';
    Modal.confirm({
      title,
      okText,
      okButtonProps: okText === 'Reject' ? { danger: true } : undefined,
      cancelText: 'Cancel',
      content: React.createElement(Input.TextArea, {
        rows: 3,
        placeholder: 'Reason (required)',
        onChange: (e: any) => {
          value = e.target.value;
        },
      }),
      onOk: () => {
        if (!value.trim()) {
          message.warning('A reason is required for this action');
          return false;
        }
        resolve(value.trim());
        return undefined;
      },
      onCancel: () => resolve(null),
    });
  });
}

function confirmDialog(title: string): Promise<boolean> {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      okText: 'OK',
      cancelText: 'Cancel',
      onOk: () => {
        resolve(true);
        return undefined;
      },
      onCancel: () => resolve(false),
    });
  });
}

async function callApproval(api: any, action: string, data: any) {
  return api.resource('approval')[action]({ values: data });
}

function useApprovalContext() {
  const api = useAPIClient();
  const record = useRecord();
  const collection = useCollection();
  let refresh: (() => void) | undefined;
  try {
    refresh = useResourceActionContext()?.refresh;
  } catch (e) {
    // Not inside a data block context.
  }
  return { api, record, collection, refresh };
}

export function useSubmitForApprovalActionProps() {
  const { api, record, collection, refresh } = useApprovalContext();
  return {
    title: 'Submit for approval',
    async onClick() {
      const recordId = getRecordId(record, collection);
      if (recordId == null) {
        message.error('Please use this action on an existing record.');
        return;
      }
      try {
        await callApproval(api, 'submit', { collection: collection.name, recordId });
        message.success('Submitted for approval');
        refresh?.();
      } catch (e: any) {
        message.error(errorText(e));
      }
    },
  };
}

export function useApproveApprovalActionProps() {
  const { api, record, collection, refresh } = useApprovalContext();
  return {
    title: 'Approve',
    async onClick() {
      const recordId = getRecordId(record, collection);
      if (recordId == null) return;
      try {
        const res = await callApproval(api, 'approve', { collection: collection.name, recordId });
        const data = res?.data?.data;
        if (data?.status === 'in_progress') {
          message.success('Approved. Waiting for the next approvers.');
        } else {
          message.success('Approved');
        }
        refresh?.();
      } catch (e: any) {
        message.error(errorText(e));
      }
    },
  };
}

export function useRejectApprovalActionProps() {
  const { api, record, collection, refresh } = useApprovalContext();
  return {
    title: 'Reject',
    danger: true,
    async onClick() {
      const recordId = getRecordId(record, collection);
      if (recordId == null) return;
      const reason = await promptForReason('Reject this request', 'Reject');
      if (reason == null) return;
      try {
        await callApproval(api, 'reject', { collection: collection.name, recordId, reason });
        message.success('Rejected');
        refresh?.();
      } catch (e: any) {
        message.error(errorText(e));
      }
    },
  };
}

export function useReturnApprovalActionProps() {
  const { api, record, collection, refresh } = useApprovalContext();
  return {
    title: 'Return',
    async onClick() {
      const recordId = getRecordId(record, collection);
      if (recordId == null) return;
      const reason = await promptForReason('Return this request to the submitter', 'Return');
      if (reason == null) return;
      try {
        await callApproval(api, 'return', { collection: collection.name, recordId, reason });
        message.success('Returned to the submitter');
        refresh?.();
      } catch (e: any) {
        message.error(errorText(e));
      }
    },
  };
}

export function useCancelApprovalActionProps() {
  const { api, record, collection, refresh } = useApprovalContext();
  return {
    title: 'Cancel approval',
    danger: true,
    async onClick() {
      const recordId = getRecordId(record, collection);
      if (recordId == null) return;
      const ok = await confirmDialog('Cancel the approval request for this record?');
      if (!ok) return;
      try {
        await callApproval(api, 'cancel', { collection: collection.name, recordId });
        message.success('Approval request cancelled');
        refresh?.();
      } catch (e: any) {
        message.error(errorText(e));
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Schema initializer items ("Configure actions" menu of tables / details)
// ---------------------------------------------------------------------------
import { useSchemaInitializer } from '@nocobase/client';

const actionSchema = (scopeName: string) => ({
  type: 'void',
  'x-component': 'Action',
  'x-use-component-props': scopeName,
});

export const approvalActionInitializerItems: Record<string, any> = {
  submitForApproval: {
    type: 'item',
    name: 'submitForApproval',
    useComponentProps() {
      const { insert } = useSchemaInitializer();
      return {
        title: 'Submit for approval',
        onClick: () => insert(actionSchema('useSubmitForApprovalActionProps')),
      };
    },
  },
  approveApproval: {
    type: 'item',
    name: 'approveApproval',
    useComponentProps() {
      const { insert } = useSchemaInitializer();
      return {
        title: 'Approve',
        onClick: () => insert(actionSchema('useApproveApprovalActionProps')),
      };
    },
  },
  rejectApproval: {
    type: 'item',
    name: 'rejectApproval',
    useComponentProps() {
      const { insert } = useSchemaInitializer();
      return {
        title: 'Reject',
        onClick: () => insert(actionSchema('useRejectApprovalActionProps')),
      };
    },
  },
  returnApproval: {
    type: 'item',
    name: 'returnApproval',
    useComponentProps() {
      const { insert } = useSchemaInitializer();
      return {
        title: 'Return',
        onClick: () => insert(actionSchema('useReturnApprovalActionProps')),
      };
    },
  },
  cancelApproval: {
    type: 'item',
    name: 'cancelApproval',
    useComponentProps() {
      const { insert } = useSchemaInitializer();
      return {
        title: 'Cancel approval',
        onClick: () => insert(actionSchema('useCancelApprovalActionProps')),
      };
    },
  },
};
