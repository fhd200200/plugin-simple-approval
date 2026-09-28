import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAPIClient } from '@nocobase/client';

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
  const api = useAPIClient();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>({});
  const [myApprovals, setMyApprovals] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
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
      message.success('Request cancelled');
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.errors?.[0]?.message || e?.message || 'Failed');
    }
  };

  const baseColumns: any[] = [
    { title: 'Request No.', dataIndex: 'requestNo', width: 160 },
    { title: 'Template', dataIndex: 'templateName' },
    { title: 'Collection', dataIndex: 'targetCollection', width: 160 },
    { title: 'Record ID', dataIndex: 'targetRecordId', width: 100 },
    {
      title: 'Current step',
      dataIndex: 'currentStep',
      width: 110,
      render: (v: any, row: any) => (row.status === 'in_progress' ? `#${v}` : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 130,
      render: (v: string) => <Tag color={STATUS_COLORS[v] || 'default'}>{v}</Tag>,
    },
    { title: 'Submitted at', dataIndex: 'submittedAt', width: 180, render: formatDate },
  ];

  const approvalsColumns = [
    ...baseColumns,
    { title: 'Submitted by', dataIndex: 'submittedByName', width: 140 },
    {
      title: 'Action',
      key: 'review',
      width: 110,
      render: (_: any, row: any) => (
        <Button type="primary" size="small" onClick={() => navigate(`/approval/review/${row.id}`)}>
          Review
        </Button>
      ),
    },
  ];

  const requestsColumns = [
    ...baseColumns,
    {
      title: 'Action',
      key: 'actions',
      width: 170,
      render: (_: any, row: any) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/approval/review/${row.id}`)}>
            View
          </Button>
          {['pending', 'in_progress'].includes(row.status) && (
            <Popconfirm
              title="Cancel this approval request?"
              onConfirm={() => cancelRequest(row)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" danger>
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>
        <AuditOutlined /> Approval Center
      </Typography.Title>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Pending my approval" value={summary.pendingApprovals ?? 0} prefix={<InboxOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="My requests (in progress)"
              value={summary.inProgress ?? 0}
              prefix={<FileDoneOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Approved" value={summary.approved ?? 0} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Rejected" value={summary.rejected ?? 0} prefix={<CloseCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Tabs
          items={[
            {
              key: 'approvals',
              label: `My Approvals (${myApprovals.length})`,
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
              label: `My Requests (${myRequests.length})`,
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
