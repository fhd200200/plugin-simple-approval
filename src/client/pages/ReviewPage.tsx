import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { useAPIClient } from '@nocobase/client';

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
  const api = useAPIClient();
  const navigate = useNavigate();
  const params = useParams();
  const requestId = params?.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!requestId) {
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
    const run = async (reason?: string) => {
      try {
        await api.request({
          url: `approval:${action}/${requestId}`,
          method: 'POST',
          data: { reason },
        });
        message.success('Done');
        load();
      } catch (e: any) {
        message.error(e?.response?.data?.errors?.[0]?.message || e?.message || 'Failed');
      }
    };

    if (action !== 'reject' && action !== 'return') {
      run();
      return;
    }
    let value = '';
    Modal.confirm({
      title: action === 'reject' ? 'Reject this request' : 'Return this request to the submitter',
      okText: action === 'reject' ? 'Reject' : 'Return',
      okButtonProps: action === 'reject' ? { danger: true } : undefined,
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
          Approval request not found. It may have been removed, or the id is invalid.
        </Typography.Text>
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => navigate('/approval-center')}>Back to Approval Center</Button>
        </div>
      </Card>
    );
  }

  const snapshotRows = Object.entries(data.snapshot || {})
    .filter(([, value]) => value !== null && typeof value !== 'object')
    .map(([key, value]) => ({ key, field: key, value: String(value) }));

  return (
    <div style={{ padding: 24 }}>
      <Space align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {data.requestNo}
        </Typography.Title>
        <Tag color={STATUS_COLORS[data.status] || 'default'}>{data.status}</Tag>
      </Space>

      <Card title="Request details">
        <Descriptions
          bordered
          size="small"
          column={2}
          items={[
            { key: 'template', label: 'Template', children: data.templateName },
            { key: 'collection', label: 'Collection', children: data.targetCollection },
            { key: 'record', label: 'Record', children: `#${data.targetRecordId}` },
            { key: 'submittedBy', label: 'Submitted by', children: data.submittedByName },
            { key: 'submittedAt', label: 'Submitted at', children: formatDate(data.submittedAt) },
            {
              key: 'currentStep',
              label: 'Current step',
              children: data.status === 'in_progress' ? `#${data.currentStep}` : '-',
            },
            { key: 'completedAt', label: 'Completed at', children: formatDate(data.completedAt) },
            ...(data.rejectionReason
              ? [{ key: 'rejectionReason', label: 'Rejection reason', children: data.rejectionReason }]
              : []),
            ...(data.returnReason
              ? [{ key: 'returnReason', label: 'Return reason', children: data.returnReason }]
              : []),
          ]}
        />
        {['pending', 'in_progress'].includes(data.status) && (
          <Space style={{ marginTop: 16 }} wrap>
            {data.canApprove && (
              <>
                <Button type="primary" onClick={() => doAction('approve')}>
                  Approve
                </Button>
                <Button danger onClick={() => doAction('reject')}>
                  Reject
                </Button>
                <Button onClick={() => doAction('return')}>Return</Button>
              </>
            )}
            {data.canCancel && (
              <Button danger onClick={() => doAction('cancel')}>
                Cancel
              </Button>
            )}
          </Space>
        )}
      </Card>

      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        <Card title="Approval steps" style={{ flex: '1 1 320px', minWidth: 320 }}>
          <Timeline
            items={(data.steps || []).map((s: any) => ({
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
                  <b>{`Step ${s.stepOrder}: ${s.name}`}</b>
                  <br />
                  <Typography.Text type="secondary">
                    {s.approverType === 'user'
                      ? 'Specific user'
                      : s.approverType === 'users'
                        ? 'Multiple users'
                        : 'Role'}
                    {' · '}
                    {s.mode === 'parallel' ? 'Parallel' : 'Sequential'}
                    {s.mode === 'parallel'
                      ? ` · ${s.completionRule === 'any' ? 'Any one approver' : 'All approvers'}`
                      : ''}
                  </Typography.Text>
                </>
              ),
            }))}
          />
        </Card>

        <Card title="History" style={{ flex: '1 1 320px', minWidth: 320 }}>
          <Timeline
            items={(data.history || []).map((h: any, i: number) => ({
              color: ACTION_COLORS[h.action] || 'gray',
              key: i,
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
            }))}
          />
        </Card>

        <Card title="Record snapshot" style={{ flex: '1 1 100%' }}>
          <Table
            rowKey="key"
            size="small"
            dataSource={snapshotRows}
            pagination={false}
            columns={[
              { title: 'Field', dataIndex: 'field', width: 240 },
              { title: 'Value', dataIndex: 'value' },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
