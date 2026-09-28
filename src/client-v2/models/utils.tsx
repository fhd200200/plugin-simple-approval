import React from 'react';
import { Input, Modal, message } from 'antd';
import { NAMESPACE } from '../locale';

/** Extract the current record + collection from a flow action context. */
export function getRecordContext(ctx: any): { record: any; collection: string | null } {
  const record =
    ctx?.record ??
    (typeof ctx?.blockModel?.getCurrentRecord === 'function' ? ctx.blockModel.getCurrentRecord() : null) ??
    ctx?.model?.context?.record ??
    null;
  const collection =
    ctx?.collection?.name ??
    ctx?.blockModel?.collection?.name ??
    ctx?.model?.collection?.name ??
    null;
  return { record, collection };
}

/** Resolve the primary key value of a record. */
export function resolveRecordId(ctx: any, record: any): any {
  if (record == null) return null;
  if (record.id != null) return record.id;
  const viaTk =
    (typeof ctx?.collection?.getFilterByTK === 'function' && ctx.collection.getFilterByTK(record)) ??
    (typeof ctx?.model?.collection?.getFilterByTK === 'function' && ctx.model.collection.getFilterByTK(record));
  return viaTk ?? null;
}

/** POST /api/approval:<action>[/<id>] */
export function callApproval(ctx: any, action: string, data?: any, id?: any) {
  const url = id != null ? `approval:${action}/${id}` : `approval:${action}`;
  return ctx.api.request({ url, method: 'POST', data: data || {} });
}

/** Show an error coming from the API in a friendly way. */
export function showError(ctx: any, e: any) {
  const text =
    e?.response?.data?.errors?.[0]?.message ||
    e?.response?.data?.error ||
    e?.message ||
    'Request failed';
  try {
    ctx.message.error(ctx.t ? ctx.t(String(text)) : String(text));
  } catch {
    message.error(String(text));
  }
}

/** Prompt the user for a mandatory reason. Resolves null when cancelled. */
export function promptForReason(title: string, okText: string, t: (s: string) => string): Promise<string | null> {
  return new Promise((resolve) => {
    let value = '';
    Modal.confirm({
      title,
      okText,
      cancelText: t('Cancel'),
      content: React.createElement(Input.TextArea, {
        rows: 3,
        placeholder: t('Reason (required)'),
        onChange: (e: any) => {
          value = e.target.value;
        },
      }),
      onOk: () => {
        if (!value.trim()) {
          message.warning(t('A reason is required for this action'));
          return false;
        }
        resolve(value.trim());
        return undefined;
      },
      onCancel: () => resolve(null),
    });
  });
}

/** Simple confirm dialog. Resolves false when cancelled. */
export function confirmAction(title: string, t: (s: string) => string): Promise<boolean> {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      okText: t('OK'),
      cancelText: t('Cancel'),
      onOk: () => {
        resolve(true);
        return undefined;
      },
      onCancel: () => resolve(false),
    });
  });
}

export const ns = NAMESPACE;
