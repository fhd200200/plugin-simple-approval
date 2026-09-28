import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Steps,
  Switch,
  Table,
  Tabs,
  Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useAPIClient } from '@nocobase/client';

const APPROVER_TYPES = [
  { value: 'user', label: 'Specific user' },
  { value: 'users', label: 'Multiple users' },
  { value: 'role', label: 'Role' },
];

const MODES = [
  { value: 'sequential', label: 'Sequential' },
  { value: 'parallel', label: 'Parallel' },
];

const COMPLETION_RULES = [
  { value: 'all', label: 'All approvers must approve' },
  { value: 'any', label: 'Any one approver is enough' },
];

const STATUS_EVENTS = [
  { key: 'submitted', label: 'On submit' },
  { key: 'approved', label: 'On approved' },
  { key: 'rejected', label: 'On rejected' },
  { key: 'returned', label: 'On returned' },
  { key: 'cancelled', label: 'On cancelled' },
];

function newStep(): any {
  return { name: '', approverType: 'user', approverConfig: {}, mode: 'sequential', completionRule: 'all' };
}

function UserSelect({ multiple, value, onChange, api, placeholder }: any) {
  const [options, setOptions] = useState<any[]>([]);

  const search = useCallback(
    async (keyword?: string) => {
      try {
        const res = await api.request({
          url: 'approval:searchUsers',
          method: 'GET',
          params: { keyword: keyword || '' },
        });
        setOptions((res?.data?.data || []).map((u: any) => ({ value: u.id, label: u.label })));
      } catch {
        setOptions([]);
      }
    },
    [api],
  );

  useEffect(() => {
    search('');
  }, [search]);

  return (
    <Select
      mode={multiple ? 'multiple' : undefined}
      showSearch
      allowClear
      style={{ width: '100%' }}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onSearch={(kw: string) => search(kw)}
      filterOption={false}
      options={options}
    />
  );
}

function StepEditor({ step, index, onChange, onRemove, api, roles }: any) {
  return (
    <Card size="small" title={`Step ${index + 1}`} extra={<a onClick={onRemove}>Remove</a>}>
      <Row gutter={12}>
        <Col span={12}>
          <Typography.Text type="secondary">Step name</Typography.Text>
          <Input
            style={{ marginTop: 4 }}
            value={step.name}
            placeholder="e.g. Manager review"
            onChange={(e) => onChange({ ...step, name: e.target.value })}
          />
        </Col>
        <Col span={12}>
          <Typography.Text type="secondary">Approver type</Typography.Text>
          <Select
            style={{ width: '100%', marginTop: 4 }}
            value={step.approverType}
            options={APPROVER_TYPES}
            onChange={(v) => onChange({ ...step, approverType: v, approverConfig: {} })}
          />
        </Col>
      </Row>
      <div style={{ marginTop: 12 }}>
        {step.approverType === 'user' && (
          <UserSelect
            api={api}
            placeholder="Select the approver"
            value={step.approverConfig?.userId}
            onChange={(v: any) => onChange({ ...step, approverConfig: { ...step.approverConfig, userId: v } })}
          />
        )}
        {step.approverType === 'users' && (
          <UserSelect
            api={api}
            multiple
            placeholder="Select the approvers"
            value={step.approverConfig?.userIds}
            onChange={(v: any) => onChange({ ...step, approverConfig: { ...step.approverConfig, userIds: v } })}
          />
        )}
        {step.approverType === 'role' && (
          <Select
            style={{ width: '100%' }}
            showSearch
            allowClear
            placeholder="Select a role"
            value={step.approverConfig?.roleName}
            onChange={(v: any) => onChange({ ...step, approverConfig: { ...step.approverConfig, roleName: v } })}
            options={roles.map((r: any) => ({ value: r.name, label: r.title || r.name }))}
          />
        )}
      </div>
      <Row gutter={12} style={{ marginTop: 12 }}>
        <Col span={12}>
          <Typography.Text type="secondary">Mode</Typography.Text>
          <Select
            style={{ width: '100%', marginTop: 4 }}
            value={step.mode}
            options={MODES}
            onChange={(v) => onChange({ ...step, mode: v })}
          />
        </Col>
        <Col span={12}>
          <Typography.Text type="secondary">Completion rule</Typography.Text>
          <Select
            style={{ width: '100%', marginTop: 4 }}
            value={step.completionRule}
            options={COMPLETION_RULES}
            onChange={(v) => onChange({ ...step, completionRule: v })}
          />
        </Col>
      </Row>
    </Card>
  );
}

function TemplateModal({ open, template, onClose, onSaved, api, collections, roles }: any) {
  const [form] = Form.useForm();
  const [steps, setSteps] = useState<any[]>([newStep()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (template) {
        form.setFieldsValue({
          name: template.name,
          description: template.description,
          targetCollection: template.targetCollection,
          active: template.active,
          statusField: template.statusField,
          statusMapping: template.statusMapping || {},
        });
        setSteps(
          (template.steps || []).map((s: any) => ({
            name: s.name,
            approverType: s.approverType,
            approverConfig: s.approverConfig || {},
            mode: s.mode || 'sequential',
            completionRule: s.completionRule || 'all',
          })),
        );
      } else {
        form.resetFields();
        form.setFieldsValue({ active: true });
        setSteps([newStep()]);
      }
    }
  }, [open, template, form]);

  const save = async (values: any) => {
    if (!steps.length) {
      message.warning('Add at least one step');
      return;
    }
    for (const s of steps) {
      if (!(s.name || '').trim()) {
        message.warning('Every step needs a name');
        return;
      }
    }
    setSaving(true);
    try {
      const payload = { ...values, steps };
      if (template) {
        await api.request({
          url: `approval:updateTemplate/${template.id}`,
          method: 'POST',
          data: payload,
        });
      } else {
        await api.request({ url: 'approval:createTemplate', method: 'POST', data: payload });
      }
      message.success('Template saved');
      onSaved();
      onClose();
    } catch (e: any) {
      message.error(e?.response?.data?.errors?.[0]?.message || e?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={template ? `Edit template: ${template.name}` : 'New approval template'}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Save"
      cancelText="Cancel"
      confirmLoading={saving}
      width={760}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={save}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="name" label="Template name" rules={[{ required: true }]}>
              <Input placeholder="Purchase request approval" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="targetCollection" label="Target collection" rules={[{ required: true }]}>
              <Select
                showSearch
                allowClear
                options={collections.map((c: any) => ({ value: c.name, label: `${c.title} (${c.name})` }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Card size="small" title="Write status back to the record (optional)" style={{ marginBottom: 16 }}>
          <Form.Item
            name="statusField"
            label="Status field on the target collection"
            tooltip="Optional. When set, the plugin writes the mapped values below into this field of the business record."
          >
            <Input placeholder="status" />
          </Form.Item>
          <Row gutter={8}>
            {STATUS_EVENTS.map((event) => (
              <Col span={8} key={event.key}>
                <Form.Item name={['statusMapping', event.key]} label={event.label} initialValue="">
                  <Input placeholder="e.g. pending" />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Card>

        <Typography.Title level={5}>Approval steps</Typography.Title>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          {steps.map((step: any, index: number) => (
            <StepEditor
              key={index}
              step={step}
              index={index}
              api={api}
              roles={roles}
              onChange={(updated: any) => setSteps(steps.map((s, i) => (i === index ? updated : s)))}
              onRemove={() => setSteps(steps.filter((_, i) => i !== index))}
            />
          ))}
        </Space>
        <Button
          block
          type="dashed"
          icon={<PlusOutlined />}
          style={{ marginTop: 12 }}
          onClick={() => setSteps([...steps, newStep()])}
        >
          Add step
        </Button>

        <Form.Item name="active" label="Active" valuePropName="checked" style={{ marginTop: 16 }}>
          <Switch />
        </Form.Item>
        <Typography.Text type="secondary">
          Only one active template is used per collection. Activating this one deactivates the others.
        </Typography.Text>
      </Form>
    </Modal>
  );
}

function TemplatesTab() {
  const api = useAPIClient();
  const [templates, setTemplates] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tpl, cols, rls] = await Promise.all([
        api.request({ url: 'approval:listTemplates', method: 'GET' }),
        api.request({ url: 'approval:listCollections', method: 'GET' }),
        api.request({ url: 'approval:listRoles', method: 'GET' }),
      ]);
      setTemplates(tpl?.data?.data || []);
      setCollections(cols?.data?.data || []);
      setRoles(rls?.data?.data || []);
    } catch (e: any) {
      message.error(e?.response?.data?.errors?.[0]?.message || e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (row: any) => {
    try {
      await api.request({
        url: `approval:updateTemplate/${row.id}`,
        method: 'POST',
        data: { active: !row.active },
      });
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.errors?.[0]?.message || e?.message || 'Failed');
    }
  };

  const remove = async (row: any) => {
    try {
      await api.request({ url: `approval:destroyTemplate/${row.id}`, method: 'POST', data: {} });
      message.success('Template deleted');
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.errors?.[0]?.message || e?.message || 'Failed');
    }
  };

  const columns: any[] = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Target collection', dataIndex: 'targetCollection' },
    { title: 'Steps', dataIndex: 'steps', width: 90, render: (v: any[]) => (v || []).length },
    { title: 'Version', dataIndex: 'version', width: 90 },
    {
      title: 'Active',
      dataIndex: 'active',
      width: 100,
      render: (v: any, row: any) => <Switch checked={v} onChange={() => toggleActive(row)} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: any, row: any) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(row);
              setModalOpen(true);
            }}
          />
          <Popconfirm title="Delete this template?" onConfirm={() => remove(row)} okText="Yes" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => {
          setEditing(null);
          setModalOpen(true);
        }}
      >
        New template
      </Button>
      <Table
        rowKey="id"
        size="middle"
        loading={loading}
        dataSource={templates}
        columns={columns}
        locale={{ emptyText: <Empty description="No templates yet. Create your first approval template." /> }}
        pagination={false}
      />
      <TemplateModal
        open={modalOpen}
        template={editing}
        api={api}
        collections={collections}
        roles={roles}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  );
}

function GuideTab() {
  return (
    <div style={{ maxWidth: 960 }}>
      <Card style={{ marginBottom: 16 }}>
        <Typography.Paragraph strong>Where is everything?</Typography.Paragraph>
        <ul>
          <li>
            This settings page: <b>Settings → Plugin settings → Simple Approval</b>
          </li>
          <li>
            Approval Center: <b>/approval-center</b>
          </li>
          <li>
            Review page: <b>/approval/review/:id</b> (open from the Approval Center)
          </li>
        </ul>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Typography.Paragraph strong>Five steps to start approving</Typography.Paragraph>
        <Steps
          direction="vertical"
          current={-1}
          items={[
            {
              title: 'Create a template',
              description:
                'Click "New template". Give it a name and choose the target collection (for example Purchase Requests).',
            },
            {
              title: 'Add approval steps',
              description:
                'Each step can be assigned to a specific user, multiple users, or a role. Sequential steps run one after another. A parallel step can require all approvers or any one of them.',
            },
            {
              title: '(Optional) Map record status',
              description:
                'If the target collection has a status field, fill in "Status field" and the values to write on submit / approve / reject / return / cancel.',
            },
            {
              title: 'Activate the template',
              description: 'Turn the Active switch on. Only one active template per collection is used.',
            },
            {
              title: 'Add the buttons to your UI',
              description:
                'Open any table/details of the target collection → "Configure actions" → add "Submit for approval". Approvers can also add Approve / Reject / Return buttons, or use the Approval Center.',
            },
          ]}
        />
      </Card>
      <Card>
        <Typography.Paragraph strong>طريقة الاستخدام (عربي)</Typography.Paragraph>
        <ul>
          <li>صفحة الإعدادات: <b>Settings → Plugin settings → Simple Approval</b></li>
          <li>أنشئ قالب موافقة جديد، واختر الـ Collection المستهدفة، وأضف خطوات الموافقة (مستخدم محدد / عدة مستخدمين / دور).</li>
          <li>شغّل القالب (Active) — يُستخدم قالب واحد نشط لكل Collection.</li>
          <li>في أي جدول أو صفحة تفاصيل للـ Collection: "Configure actions" → أضف زر "Submit for approval".</li>
          <li>بعد الإرسال: يظهر الطلب في Approval Center (‎/approval-center‎) لدى المعتمدين في "My Approvals".</li>
          <li>المعتمد يفتح Review وينفذ Approve أو Reject (بسبب إلزامي) أو Return (بسبب إلزامي).</li>
          <li>صاحب الطلب يمكنه الإلغاء (Cancel) ما دام الطلب قيد التنفيذ، وكل حركة تُسجَّل في Timeline.</li>
        </ul>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div style={{ padding: 24 }}>
      <Tabs
        items={[
          { key: 'templates', label: 'Approval Templates', children: <TemplatesTab /> },
          { key: 'guide', label: 'How to use', children: <GuideTab /> },
        ]}
      />
    </div>
  );
}
