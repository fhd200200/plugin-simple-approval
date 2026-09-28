# Usage Guide / دليل الاستخدام — Simple Approval

## Where is everything? / أين تجد كل شيء؟

| What | Where |
| --- | --- |
| **صفحة إعدادات الإضافة** (Plugin settings) | **Settings → Plugin settings → Simple Approval** — فيها تبويبان: **Approval Templates** و **How to use** |
| **Approval Center** (لوحة المتابعة) | `/v/approval-center` — إحصائيات + My Approvals + My Requests |
| **صفحة المراجعة** (Review) | من Approval Center → زر **Review**، أو مباشرة `/v/approval/review/<requestId>` |
| **أزرار السجلات** | أي Table/Details/Form → **Configure actions** → `Submit for approval` / `Approve` / `Reject` / `Return` / `Cancel approval` |

> لتسهيل الوصول، يمكنك إضافة رابط في القائمة الجانبية يشير إلى `/v/approval-center`.

---

## English — step by step

### 1. Create a template

1. Open **Settings → Plugin settings → Simple Approval → Approval Templates**.
2. Click **New template**.
3. **Template name**: e.g. `Purchase request approval`.
4. **Target collection**: pick the business collection this approval applies to (e.g. *Purchase Requests*).
5. *(Optional)* **Status write-back**: set `Status field` (e.g. `status`) and the values to write on each event (e.g. submit → `pending`, approved → `approved`, rejected → `rejected`).

### 2. Define the steps

Each step has:

- **Step name** — e.g. `Manager review`.
- **Approver type**:
  - *Specific user* — one chosen user.
  - *Multiple users* — several chosen users.
  - *Role* — everyone holding a role (e.g. `finance`). Approvers are resolved when the step starts.
- **Mode**:
  - *Sequential* — one step at a time (a step with a single user is sequential by nature).
  - *Parallel* — for steps with several approvers:
    - *All approvers must approve* — the step completes only after every approver approves.
    - *Any one approver is enough* — the first approval completes the step.

Use **Add step** to append more steps; steps run in their listed order.

### 3. Activate

Toggle **Active** on and save. Only **one active template per collection** is used;
activating a new one deactivates the previous automatically.

### 4. Add the buttons to your UI

1. Open any table/details/form block of the target collection.
2. **Configure actions** → add **Submit for approval** (for submitters).
3. Optionally add **Approve**, **Reject**, **Return** (for approvers) and **Cancel approval** (for the submitter).

> Approvers can also do everything from the **Approval Center** without any extra buttons.

### 5. Daily flow

1. A user opens a record → **Submit for approval**. A **snapshot** of the record is stored.
2. The request appears in the approvers' **Approval Center → My Approvals**.
3. The approver opens **Review** and:
   - **Approve** — passes to the next step (or completes the request),
   - **Reject** — ends the request (a **reason is required**),
   - **Return** — sends it back to the submitter (a **reason is required**).
4. The submitter can **Cancel** while the request is in progress.
5. Everything is written to the request **history timeline**.
6. If configured, the business record's status field is updated automatically.

---

## العربية — خطوة بخطوة

### 1. إنشاء القالب

1. افتح **Settings → Plugin settings → Simple Approval → Approval Templates**.
2. اضغط **New template**.
3. **Template name**: مثال `موفقة طلبات الشراء`.
4. **Target collection**: اختر الـ Collection المستهدفة (مثال: Purchase Requests).
5. (اختياري) **Status write-back**: حدد حقل الحالة (مثل `status`) والقيم التي تُكتب عند كل حدث (مثال: submit → `pending`، approved → `approved`).

### 2. تعريف الخطوات

كل خطوة تحتوي على:

- **اسم الخطوة**: مثال `مراجعة المدير`.
- **نوع المعتمد**:
  - *Specific user* — مستخدم واحد محدد.
  - *Multiple users* — عدة مستخدمين محددين.
  - *Role* — كل من يحمل الدور المختار (مثل `finance`).
- **النمط**:
  - *Sequential* — تنفيذ تسلسلي خطوة بعد خطوة.
  - *Parallel* — لعدة معتمدين: **All** (يجب أن يوافق الجميع) أو **Any one** (يكفي أول موافقة).

### 3. التفعيل

شغّل مفتاح **Active** واحفظ. يُستخدم **قالب واحد نشط لكل Collection**، وتفعيل قالب جديد يعطّل السابق تلقائيًا.

### 4. إضافة الأزرار للواجهة

1. افتح أي جدول أو صفحة تفاصيل تخص الـ Collection المستهدفة.
2. **Configure actions** → أضف **Submit for approval** (لصاحب الطلب).
3. أضف اختياريًا: **Approve** و **Reject** و **Return** (للمعتمدين) و **Cancel approval** (لإلغاء الطلب).

### 5. الاستخدام اليومي

1. يفتح المستخدم السجل → **Submit for approval** → يُحفظ **Snapshot** للسجل.
2. يظهر الطلب لدى المعتمدين في **Approval Center → My Approvals**.
3. يفتح المعتمد **Review** وينفذ:
   - **Approve** — تنتقل للخطوة التالية أو تكتمل الموافقة،
   - **Reject** — إنهاء الطلب (السبب **إلزامي**)،
   - **Return** — إرجاع لصاحب الطلب (السبب **إلزامي**).
4. صاحب الطلب يستطيع **Cancel** ما دام الطلب قيد التنفيذ.
5. كل حركة تُسجَّل في **Timeline** الخاص بالطلب.
6. حقل الحالة في السجل يُحدَّث تلقائيًا إذا كان مفعّلًا في القالب.

---

## Notes / ملاحظات

- بعد **Reject** أو **Return** يُغلق الطلب؛ يمكن لصاحب الطلب إرسال **طلب جديد** على نفس السجل بعد التعديل.
- المتقدمون للخطوة يُحلّلون عند بدء الخطوة (تغيير أعضاء الدور لاحقًا لا يؤثر على الخطوة الجارية).
- كل الـ APIs محمية: أفعال المستخدم تحتاج تسجيل دخول، وإدارة القوالب للمشرفين فقط، والصلاحيات على مستوى الطلب (المعتمد الحالي/صاحب الطلب) مفروضة داخل المحرك.
