import React from 'react';
import { Card, Steps, Typography } from 'antd';
import { useT } from '../locale';

export default function GuidePage() {
  const t = useT();
  return (
    <div style={{ padding: 24, maxWidth: 960 }}>
      <Typography.Title level={3}>{t('How to use Simple Approval')}</Typography.Title>

      <Card style={{ marginBottom: 16 }}>
        <Typography.Paragraph strong>{t('Where is everything?')}</Typography.Paragraph>
        <ul>
          <li>
            {t('This settings page')}: <b>{t('Settings → Plugin settings → Simple Approval')}</b>
          </li>
          <li>
            {t('Approval Center (dashboard)')}: <b>/v/approval-center</b>
          </li>
          <li>
            {t('Review page')}: <b>/v/approval/review/:id</b>
          </li>
        </ul>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Typography.Paragraph strong>{t('Five steps to start approving')}</Typography.Paragraph>
        <Steps
          direction="vertical"
          current={-1}
          items={[
            {
              title: t('Create a template'),
              description: t(
                'On the "Approval Templates" tab, click "New template". Give it a name and choose the target collection (for example Purchase Requests).',
              ),
            },
            {
              title: t('Add approval steps'),
              description: t(
                'Each step can be assigned to a specific user, multiple users, or a role. Sequential steps run one after another. A parallel step can require all approvers or any one of them.',
              ),
            },
            {
              title: t('(Optional) Map record status'),
              description: t(
                'If the target collection has a status field, fill in "Status field" and the values to write on submit / approve / reject / return / cancel.',
              ),
            },
            {
              title: t('Activate the template'),
              description: t(
                'Turn the Active switch on. Only one active template per collection is used.',
              ),
            },
            {
              title: t('Add the buttons to your UI'),
              description: t(
                'Open any table/block of the target collection → "Configure actions" → add "Submit for approval". Approvers can also add "Approve / Reject / Return" buttons the same way, or use the Approval Center.',
              ),
            },
          ]}
        />
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Typography.Paragraph strong>{t('Daily usage')}</Typography.Paragraph>
        <ul>
          <li>{t('A user opens a record and clicks "Submit for approval". A snapshot of the record is stored.')}</li>
          <li>{t('Approvers see the request in the Approval Center under "My Approvals" and open the review page.')}</li>
          <li>{t('They can Approve, Reject (reason required) or Return it to the submitter (reason required).')}</li>
          <li>{t('The submitter can cancel while the request is still in progress.')}</li>
          <li>{t('Every action is recorded in the history timeline of the request.')}</li>
        </ul>
      </Card>

      <Card>
        <Typography.Paragraph strong>طريقة الاستخدام (عربي)</Typography.Paragraph>
        <ul>
          <li>صفحة الإعدادات: <b>Settings → Plugin settings → Simple Approval</b></li>
          <li>أنشئ قالب موافقة جديد، واختر الـ Collection المستهدفة، وأضف خطوات الموافقة (مستخدم محدد / عدة مستخدمين / دور).</li>
          <li>شغّل القالب (Active) — يُستخدم قالب واحد نشط لكل Collection.</li>
          <li>في أي جدول أو صفحة تفاصيل للـ Collection: "Configure actions" → أضف زر "Submit for approval".</li>
          <li>بعد الإرسال: يظهر الطلب في Approval Center (‎/v/approval-center‎) لدى المعتمدين في "My Approvals".</li>
          <li>المعتمد يفتح Review وينفذ Approve أو Reject (بسبب إلزامي) أو Return (بسبب إلزامي).</li>
          <li>صاحب الطلب يمكنه الإلغاء (Cancel) ما دام الطلب قيد التنفيذ، وكل حركة تُسجَّل في Timeline.</li>
        </ul>
      </Card>
    </div>
  );
}
