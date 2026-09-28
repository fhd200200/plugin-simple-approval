import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Input,
  message,
  Modal,
  Skeleton,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { useFlowContext } from '@nocobase/flow-engine';
import { useT } from '../locale';

const STATUS_COLORS: Record<string, string> = {
  pending: 'orange',
  in_progress: 'processing',
  approved: 'success',
  rejected: 'error',
  returned: 'warning',
  cancelled: 'default',
};

const ACTION_COLORS: Record<string, string> = {
  submitted: 'blue',
  approved: 'green',
  rejected: 'red',
  returned: 'orange',
  cancelled: 'default',
};

function formatDate(v: any) {
  if (!v) return '';
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

export default function ReviewPage() {
  const ctx = useFlowContext();
  const t = useT();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const requestId = ctx?.route?.params?.id;

  const api = ctx?.api;

  const load = useCallback(async () => {
    if (!api || !requestId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.request({ url: `approval:getRequest/${requestId}`, method: 'GET' });
      setData(res?.data?.data);
    } catch (e: any) {
      message.error(e?.response?.data?.errors?.[0]?.message || e?.message || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  }, [api, requestId]);

  useEffect(() => {
    load();
  }, [load]);

  const doAction = (action: 'approve' | 'reject' | 'return' | 'cancel') => {
    const needsReason = action === 'reject' || action === 'return';
    const run = async (reason?: string) => {
      try {
        await api.request({
          url: `approval:${action}/${requestId}`,
          method: 'POST',
          data: { reason },
        });
        message.success(t('Done'));
        load();
      } catch (e: any) {
        message.error(e?.response?.data?.errors?.[0]?.message || e?.message || 'Failed');
      }
    };

    if (!needsReason) {
      run();
      return;
    }
    let value = '';
    Modal.confirm({
      title: action === 'reject' ? t('Reject this request') : t('Return this request to the submitter'),
      okText: action === 'reject' ? t('Reject') : t('Return'),
      okButtonProps: action === 'reject' ? { danger: true } : undefined,
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
        run(value.trim());
        return undefined;
      },
    });
  };

  if (loading) {
    return (
      <Card style={{ margin: 24 }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card style={{ margin: 24 }}>
        <Typography.Text type="danger">
          {t('Approval request not found. It may have been removed, or the id is invalid.')}
        </Typography.Text>
      </Card>
    );
  }

  const snapshotRows = Object.entries(data.snapshot || {})
    .filter(([key, value]) => value !== null && typeof value !== 'object')
    .map(([key, value]) => ({ key, field: key, value: String(value) }));

  return (
    <div style={{ padding: 24 }}>
      <Space align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {data.requestNo}
        </Typography.Title>
        <Tag color={STATUS_COLORS[data.status] || 'default'}>{data.status}</Tag>
      </Space>

      <Card title={t('Request details')}>
        <Descriptions
          bordered
          size="small"
          column={2}
          items={[
            { key: 'template', label: t('Template'), children: data.templateName },
            { key: 'collection', label: t('Collection'), children: data.targetCollection },
            {
              key: 'record',
              label: t('Record'),
              children: (
                <a
                  href={`#${data.targetCollection}/${data.targetRecordId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    ctx?.router?.navigate?.(`/admin/${data.targetCollection}/${data.targetRecordId}`);
                  }}
                >
                  #{data.targetRecordId}
                </a>
              ),
            },
            { key: 'submittedBy', label: t('Submitted by'), children: data.submittedByName },
            { key: 'submittedAt', label: t('Submitted at'), children: formatDate(data.submittedAt) },
            { key: 'currentStep', label: t('Current step'), children: data.status === 'in_progress' ? `#${data.currentStep}` : '-' },
            { key: 'completedAt', label: t('Completed at'), children: formatDate(data.completedAt) },
            ...(data.rejectionReason
              ? [{ key: 'rejectionReason', label: t('Rejection reason'), children: data.rejectionReason }]
              : []),
            ...(data.returnReason
              ? [{ key: 'returnReason', label: t('Return reason'), children: data.returnReason }]
              : []),
          ]}
        />
        {['pending', 'in_progress'].includes(data.status) && (
          <Space style={{ marginTop: 16 }} wrap>
            {data.canApprove && (
              <>
                <Button type="primary" onClick={() => doAction('approve')}>
                  {t('Approve')}
                </Button>
                <Button danger onClick={() => doAction('reject')}>
                  {t('Reject')}
                </Button>
                <Button onClick={() => doAction('return')}>{t('Return')}</Button>
              </>
            )}
            {data.canCancel && (
              <Button danger onClick={() => doAction('cancel')}>
                {t('Cancel')}
              </Button>
            )}
          </Space>
        )}
      </Card>

      <RowCards data={data} t={t} snapshotRows={snapshotRows} />
    </div>
  );
}

function RowCards({ data, t, snapshotRows }: any) {
  return (
    <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
      <Card title={t('Approval steps')} style={{ flex: '1 1 320px', minWidth: 320 }}>
        <Timeline
          items={(data.steps || []).map((s: any, index: number) => ({
            color:
              data.status === 'approved'
                ? 'green'
                : s.stepOrder < data.currentStep
                  ? 'green'
                  : s.stepOrder === data.currentStep && data.status === 'in_progress'
                    ? 'blue'
                    : 'gray',
            children: (
              <>
                <b>{`${t('Step')} ${s.stepOrder}: ${s.name}`}</b>
                <br />
                <Typography.Text type="secondary">
                  {s.approverType === 'user'
                    ? t('Specific user')
                    : s.approverType === 'users'
                      ? t('Multiple users')
                      : t('Role')}
                  {' · '}
                  {s.mode === 'parallel' ? t('Parallel') : t('Sequential')}
                  {s.mode === 'parallel' ? ` · ${s.completionRule === 'any' ? t('Any one approver') : t('All approvers')}` : ''}
                </Typography.Text>
              </>
            ),
          }))}
        />
      </Card>

      <Card title={t('History')} style={{ flex: '1 1 320px', minWidth: 320 }}>
        <Timeline
          items={(data.history || []).map((h: any, i: number) => ({
            color: ACTION_COLORS[h.action] || 'gray',
            children: (
              <>
                <b>{h.action}</b> — {h.actorName}
                <br />
                {h.comment ? <Typography.Text type="secondary">{h.comment}</Typography.Text> : null}
                <br />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDate(h.createdAt)}
                </Typography.Text>
              </>
            ),
            key: i,
          }))}
        />
      </Card>

      <Card title={t('Record snapshot')} style={{ flex: '1 1 100%' }}>
        <Table
          rowKey="key"
          size="small"
          dataSource={snapshotRows}
          pagination={false}
          columns={[
            { title: t('Field'), dataIndex: 'field', width: 240 },
            { title: t('Value'), dataIndex: 'value' },
          ]}
        />
      </Card>
    </div>
  );
}
