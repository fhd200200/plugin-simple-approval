import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  message,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import {
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
  InboxOutlined,
} from '@ant-design/icons';
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

function formatDate(v: any) {
  if (!v) return '';
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

export default function ApprovalCenterPage() {
  const ctx = useFlowContext();
  const t = useT();
  const [summary, setSummary] = useState<any>({});
  const [myApprovals, setMyApprovals] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const api = ctx?.api;

  const load = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [s, a, r] = await Promise.all([
        api.request({ url: 'approval:summary', method: 'GET' }),
        api.request({ url: 'approval:myApprovals', method: 'GET' }),
        api.request({ url: 'approval:myRequests', method: 'GET' }),
      ]);
      setSummary(s?.data?.data || {});
      setMyApprovals(a?.data?.data || []);
      setMyRequests(r?.data?.data || []);
    } catch (e: any) {
      message.error(e?.response?.data?.errors?.[0]?.message || e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const cancelRequest = async (row: any) => {
    try {
      await api.request({ url: `approval:cancel/${row.id}`, method: 'POST', data: {} });
      message.success(t('Request cancelled'));
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.errors?.[0]?.message || e?.message || 'Failed');
    }
  };

  const openReview = (row: any) => ctx?.router?.navigate?.(`/approval/review/${row.id}`);

  const baseColumns: any[] = [
    { title: t('Request No.'), dataIndex: 'requestNo', width: 160 },
    { title: t('Template'), dataIndex: 'templateName' },
    { title: t('Collection'), dataIndex: 'targetCollection', width: 160 },
    { title: t('Record ID'), dataIndex: 'targetRecordId', width: 100 },
    {
      title: t('Current step'),
      dataIndex: 'currentStep',
      width: 110,
      render: (v: any, row: any) => (row.status === 'in_progress' ? `#${v}` : '-'),
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      width: 130,
      render: (v: string) => <Tag color={STATUS_COLORS[v] || 'default'}>{v}</Tag>,
    },
    { title: t('Submitted at'), dataIndex: 'submittedAt', width: 180, render: formatDate },
  ];

  const approvalsColumns = [
    ...baseColumns,
    { title: t('Submitted by'), dataIndex: 'submittedByName', width: 140 },
    {
      title: t('Action'),
      key: 'review',
      width: 110,
      render: (_: any, row: any) => (
        <Button type="primary" size="small" onClick={() => openReview(row)}>
          {t('Review')}
        </Button>
      ),
    },
  ];

  const requestsColumns = [
    ...baseColumns,
    {
      title: t('Action'),
      key: 'actions',
      width: 170,
      render: (_: any, row: any) => (
        <Space>
          <Button size="small" onClick={() => openReview(row)}>
            {t('View')}
          </Button>
          {['pending', 'in_progress'].includes(row.status) && (
            <Popconfirm
              title={t('Cancel this approval request?')}
              onConfirm={() => cancelRequest(row)}
              okText={t('Yes')}
              cancelText={t('No')}
            >
              <Button size="small" danger>
                {t('Cancel')}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (!api) {
    return (
      <Card style={{ margin: 24 }}>
        <Typography.Paragraph>
          This page must be opened through the NocoBase router (/v/approval-center).
        </Typography.Paragraph>
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>
        <AuditOutlined /> {t('Approval Center')}
      </Typography.Title>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('Pending my approval')}
              value={summary.pendingApprovals ?? 0}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t('My requests (in progress)')}
              value={summary.inProgress ?? 0}
              prefix={<FileDoneOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title={t('Approved')} value={summary.approved ?? 0} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title={t('Rejected')} value={summary.rejected ?? 0} prefix={<CloseCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Tabs
          items={[
            {
              key: 'approvals',
              label: `${t('My Approvals')} (${myApprovals.length})`,
              children: (
                <Table
                  rowKey="id"
                  size="middle"
                  loading={loading}
                  dataSource={myApprovals}
                  columns={approvalsColumns}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                />
              ),
            },
            {
              key: 'requests',
              label: `${t('My Requests')} (${myRequests.length})`,
              children: (
                <Table
                  rowKey="id"
                  size="middle"
                  loading={loading}
                  dataSource={myRequests}
                  columns={requestsColumns}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
