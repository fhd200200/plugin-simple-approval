!function (root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = factory(require);
  } else if (typeof define === 'function' && define.amd) {
    define(["require","react","react-router-dom","antd","@ant-design/icons","@nocobase/client"], factory);
  } else {
    var __globals = {
      "react": root["React"],
      "react-router-dom": root["react-router-dom"],
      "antd": root["antd"],
      "@ant-design/icons": root["icons"],
      "@nocobase/client": root["client"],
    };
    factory(function (name) {
      if (name in __globals && __globals[name] !== undefined) return __globals[name];
      throw new Error('Cannot resolve module: ' + name);
    });
  }
}(typeof self !== 'undefined' ? self : this, function (__hostRequire) {
  var __injected = Array.prototype.slice.call(arguments, 1);
  var __names = ["react","react-router-dom","antd","@ant-design/icons","@nocobase/client"];
  var __map = {};
  for (var __i = 0; __i < __names.length; __i++) __map[__names[__i]] = __injected[__i];
  var require = function (name) {
    if (name in __map) {
      if (__map[name] === undefined && typeof __hostRequire === 'function') return __hostRequire(name);
      return __map[name];
    }
    if (typeof __hostRequire === 'function') return __hostRequire(name);
    throw new Error('Cannot resolve module: ' + name);
  };
  var module = { exports: {} };
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  PluginSimpleApprovalClient: () => PluginSimpleApprovalClient,
  default: () => plugin_default
});
module.exports = __toCommonJS(index_exports);

// src/client/plugin.tsx
var import_client6 = require("@nocobase/client");

// src/client/pages/SettingsPage.tsx
var import_react = __toESM(require("react"));
var import_antd = require("antd");
var import_icons = require("@ant-design/icons");
var import_client = require("@nocobase/client");
var APPROVER_TYPES = [
  { value: "user", label: "Specific user" },
  { value: "users", label: "Multiple users" },
  { value: "role", label: "Role" }
];
var MODES = [
  { value: "sequential", label: "Sequential" },
  { value: "parallel", label: "Parallel" }
];
var COMPLETION_RULES = [
  { value: "all", label: "All approvers must approve" },
  { value: "any", label: "Any one approver is enough" }
];
var STATUS_EVENTS = [
  { key: "submitted", label: "On submit" },
  { key: "approved", label: "On approved" },
  { key: "rejected", label: "On rejected" },
  { key: "returned", label: "On returned" },
  { key: "cancelled", label: "On cancelled" }
];
function newStep() {
  return { name: "", approverType: "user", approverConfig: {}, mode: "sequential", completionRule: "all" };
}
function UserSelect({ multiple, value, onChange, api, placeholder }) {
  const [options, setOptions] = (0, import_react.useState)([]);
  const search = (0, import_react.useCallback)(
    async (keyword) => {
      var _a;
      try {
        const res = await api.request({
          url: "approval:searchUsers",
          method: "GET",
          params: { keyword: keyword || "" }
        });
        setOptions((((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data) || []).map((u) => ({ value: u.id, label: u.label })));
      } catch {
        setOptions([]);
      }
    },
    [api]
  );
  (0, import_react.useEffect)(() => {
    search("");
  }, [search]);
  return /* @__PURE__ */ import_react.default.createElement(
    import_antd.Select,
    {
      mode: multiple ? "multiple" : void 0,
      showSearch: true,
      allowClear: true,
      style: { width: "100%" },
      placeholder,
      value,
      onChange,
      onSearch: (kw) => search(kw),
      filterOption: false,
      options
    }
  );
}
function StepEditor({ step, index, onChange, onRemove, api, roles }) {
  var _a, _b, _c;
  return /* @__PURE__ */ import_react.default.createElement(import_antd.Card, { size: "small", title: `Step ${index + 1}`, extra: /* @__PURE__ */ import_react.default.createElement("a", { onClick: onRemove }, "Remove") }, /* @__PURE__ */ import_react.default.createElement(import_antd.Row, { gutter: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Text, { type: "secondary" }, "Step name"), /* @__PURE__ */ import_react.default.createElement(
    import_antd.Input,
    {
      style: { marginTop: 4 },
      value: step.name,
      placeholder: "e.g. Manager review",
      onChange: (e) => onChange({ ...step, name: e.target.value })
    }
  )), /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Text, { type: "secondary" }, "Approver type"), /* @__PURE__ */ import_react.default.createElement(
    import_antd.Select,
    {
      style: { width: "100%", marginTop: 4 },
      value: step.approverType,
      options: APPROVER_TYPES,
      onChange: (v) => onChange({ ...step, approverType: v, approverConfig: {} })
    }
  ))), /* @__PURE__ */ import_react.default.createElement("div", { style: { marginTop: 12 } }, step.approverType === "user" && /* @__PURE__ */ import_react.default.createElement(
    UserSelect,
    {
      api,
      placeholder: "Select the approver",
      value: (_a = step.approverConfig) == null ? void 0 : _a.userId,
      onChange: (v) => onChange({ ...step, approverConfig: { ...step.approverConfig, userId: v } })
    }
  ), step.approverType === "users" && /* @__PURE__ */ import_react.default.createElement(
    UserSelect,
    {
      api,
      multiple: true,
      placeholder: "Select the approvers",
      value: (_b = step.approverConfig) == null ? void 0 : _b.userIds,
      onChange: (v) => onChange({ ...step, approverConfig: { ...step.approverConfig, userIds: v } })
    }
  ), step.approverType === "role" && /* @__PURE__ */ import_react.default.createElement(
    import_antd.Select,
    {
      style: { width: "100%" },
      showSearch: true,
      allowClear: true,
      placeholder: "Select a role",
      value: (_c = step.approverConfig) == null ? void 0 : _c.roleName,
      onChange: (v) => onChange({ ...step, approverConfig: { ...step.approverConfig, roleName: v } }),
      options: roles.map((r) => ({ value: r.name, label: r.title || r.name }))
    }
  )), /* @__PURE__ */ import_react.default.createElement(import_antd.Row, { gutter: 12, style: { marginTop: 12 } }, /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Text, { type: "secondary" }, "Mode"), /* @__PURE__ */ import_react.default.createElement(
    import_antd.Select,
    {
      style: { width: "100%", marginTop: 4 },
      value: step.mode,
      options: MODES,
      onChange: (v) => onChange({ ...step, mode: v })
    }
  )), /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Text, { type: "secondary" }, "Completion rule"), /* @__PURE__ */ import_react.default.createElement(
    import_antd.Select,
    {
      style: { width: "100%", marginTop: 4 },
      value: step.completionRule,
      options: COMPLETION_RULES,
      onChange: (v) => onChange({ ...step, completionRule: v })
    }
  ))));
}
function TemplateModal({ open, template, onClose, onSaved, api, collections, roles }) {
  const [form] = import_antd.Form.useForm();
  const [steps, setSteps] = (0, import_react.useState)([newStep()]);
  const [saving, setSaving] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    if (open) {
      if (template) {
        form.setFieldsValue({
          name: template.name,
          description: template.description,
          targetCollection: template.targetCollection,
          active: template.active,
          statusField: template.statusField,
          statusMapping: template.statusMapping || {}
        });
        setSteps(
          (template.steps || []).map((s) => ({
            name: s.name,
            approverType: s.approverType,
            approverConfig: s.approverConfig || {},
            mode: s.mode || "sequential",
            completionRule: s.completionRule || "all"
          }))
        );
      } else {
        form.resetFields();
        form.setFieldsValue({ active: true });
        setSteps([newStep()]);
      }
    }
  }, [open, template, form]);
  const save = async (values) => {
    var _a, _b, _c, _d;
    if (!steps.length) {
      import_antd.message.warning("Add at least one step");
      return;
    }
    for (const s of steps) {
      if (!(s.name || "").trim()) {
        import_antd.message.warning("Every step needs a name");
        return;
      }
    }
    setSaving(true);
    try {
      const payload = { ...values, steps };
      if (template) {
        await api.request({
          url: `approval:updateTemplate/${template.id}`,
          method: "POST",
          data: payload
        });
      } else {
        await api.request({ url: "approval:createTemplate", method: "POST", data: payload });
      }
      import_antd.message.success("Template saved");
      onSaved();
      onClose();
    } catch (e) {
      import_antd.message.error(((_d = (_c = (_b = (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.errors) == null ? void 0 : _c[0]) == null ? void 0 : _d.message) || (e == null ? void 0 : e.message) || "Failed");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ import_react.default.createElement(
    import_antd.Modal,
    {
      open,
      title: template ? `Edit template: ${template.name}` : "New approval template",
      onCancel: onClose,
      onOk: () => form.submit(),
      okText: "Save",
      cancelText: "Cancel",
      confirmLoading: saving,
      width: 760,
      destroyOnClose: true
    },
    /* @__PURE__ */ import_react.default.createElement(import_antd.Form, { form, layout: "vertical", onFinish: save }, /* @__PURE__ */ import_react.default.createElement(import_antd.Row, { gutter: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Form.Item, { name: "name", label: "Template name", rules: [{ required: true }] }, /* @__PURE__ */ import_react.default.createElement(import_antd.Input, { placeholder: "Purchase request approval" }))), /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Form.Item, { name: "targetCollection", label: "Target collection", rules: [{ required: true }] }, /* @__PURE__ */ import_react.default.createElement(
      import_antd.Select,
      {
        showSearch: true,
        allowClear: true,
        options: collections.map((c) => ({ value: c.name, label: `${c.title} (${c.name})` }))
      }
    )))), /* @__PURE__ */ import_react.default.createElement(import_antd.Form.Item, { name: "description", label: "Description" }, /* @__PURE__ */ import_react.default.createElement(import_antd.Input.TextArea, { rows: 2 })), /* @__PURE__ */ import_react.default.createElement(import_antd.Card, { size: "small", title: "Write status back to the record (optional)", style: { marginBottom: 16 } }, /* @__PURE__ */ import_react.default.createElement(
      import_antd.Form.Item,
      {
        name: "statusField",
        label: "Status field on the target collection",
        tooltip: "Optional. When set, the plugin writes the mapped values below into this field of the business record."
      },
      /* @__PURE__ */ import_react.default.createElement(import_antd.Input, { placeholder: "status" })
    ), /* @__PURE__ */ import_react.default.createElement(import_antd.Row, { gutter: 8 }, STATUS_EVENTS.map((event) => /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 8, key: event.key }, /* @__PURE__ */ import_react.default.createElement(import_antd.Form.Item, { name: ["statusMapping", event.key], label: event.label, initialValue: "" }, /* @__PURE__ */ import_react.default.createElement(import_antd.Input, { placeholder: "e.g. pending" })))))), /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Title, { level: 5 }, "Approval steps"), /* @__PURE__ */ import_react.default.createElement(import_antd.Space, { direction: "vertical", style: { width: "100%" }, size: 12 }, steps.map((step, index) => /* @__PURE__ */ import_react.default.createElement(
      StepEditor,
      {
        key: index,
        step,
        index,
        api,
        roles,
        onChange: (updated) => setSteps(steps.map((s, i) => i === index ? updated : s)),
        onRemove: () => setSteps(steps.filter((_, i) => i !== index))
      }
    ))), /* @__PURE__ */ import_react.default.createElement(
      import_antd.Button,
      {
        block: true,
        type: "dashed",
        icon: /* @__PURE__ */ import_react.default.createElement(import_icons.PlusOutlined, null),
        style: { marginTop: 12 },
        onClick: () => setSteps([...steps, newStep()])
      },
      "Add step"
    ), /* @__PURE__ */ import_react.default.createElement(import_antd.Form.Item, { name: "active", label: "Active", valuePropName: "checked", style: { marginTop: 16 } }, /* @__PURE__ */ import_react.default.createElement(import_antd.Switch, null)), /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Text, { type: "secondary" }, "Only one active template is used per collection. Activating this one deactivates the others."))
  );
}
function TemplatesTab() {
  const api = (0, import_client.useAPIClient)();
  const [templates, setTemplates] = (0, import_react.useState)([]);
  const [collections, setCollections] = (0, import_react.useState)([]);
  const [roles, setRoles] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [modalOpen, setModalOpen] = (0, import_react.useState)(false);
  const [editing, setEditing] = (0, import_react.useState)(null);
  const load = (0, import_react.useCallback)(async () => {
    var _a, _b, _c, _d, _e, _f, _g;
    setLoading(true);
    try {
      const [tpl, cols, rls] = await Promise.all([
        api.request({ url: "approval:listTemplates", method: "GET" }),
        api.request({ url: "approval:listCollections", method: "GET" }),
        api.request({ url: "approval:listRoles", method: "GET" })
      ]);
      setTemplates(((_a = tpl == null ? void 0 : tpl.data) == null ? void 0 : _a.data) || []);
      setCollections(((_b = cols == null ? void 0 : cols.data) == null ? void 0 : _b.data) || []);
      setRoles(((_c = rls == null ? void 0 : rls.data) == null ? void 0 : _c.data) || []);
    } catch (e) {
      import_antd.message.error(((_g = (_f = (_e = (_d = e == null ? void 0 : e.response) == null ? void 0 : _d.data) == null ? void 0 : _e.errors) == null ? void 0 : _f[0]) == null ? void 0 : _g.message) || (e == null ? void 0 : e.message) || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [api]);
  (0, import_react.useEffect)(() => {
    load();
  }, [load]);
  const toggleActive = async (row) => {
    var _a, _b, _c, _d;
    try {
      await api.request({
        url: `approval:updateTemplate/${row.id}`,
        method: "POST",
        data: { active: !row.active }
      });
      load();
    } catch (e) {
      import_antd.message.error(((_d = (_c = (_b = (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.errors) == null ? void 0 : _c[0]) == null ? void 0 : _d.message) || (e == null ? void 0 : e.message) || "Failed");
    }
  };
  const remove = async (row) => {
    var _a, _b, _c, _d;
    try {
      await api.request({ url: `approval:destroyTemplate/${row.id}`, method: "POST", data: {} });
      import_antd.message.success("Template deleted");
      load();
    } catch (e) {
      import_antd.message.error(((_d = (_c = (_b = (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.errors) == null ? void 0 : _c[0]) == null ? void 0 : _d.message) || (e == null ? void 0 : e.message) || "Failed");
    }
  };
  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Target collection", dataIndex: "targetCollection" },
    { title: "Steps", dataIndex: "steps", width: 90, render: (v) => (v || []).length },
    { title: "Version", dataIndex: "version", width: 90 },
    {
      title: "Active",
      dataIndex: "active",
      width: 100,
      render: (v, row) => /* @__PURE__ */ import_react.default.createElement(import_antd.Switch, { checked: v, onChange: () => toggleActive(row) })
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, row) => /* @__PURE__ */ import_react.default.createElement(import_antd.Space, null, /* @__PURE__ */ import_react.default.createElement(
        import_antd.Button,
        {
          size: "small",
          icon: /* @__PURE__ */ import_react.default.createElement(import_icons.EditOutlined, null),
          onClick: () => {
            setEditing(row);
            setModalOpen(true);
          }
        }
      ), /* @__PURE__ */ import_react.default.createElement(import_antd.Popconfirm, { title: "Delete this template?", onConfirm: () => remove(row), okText: "Yes", cancelText: "No" }, /* @__PURE__ */ import_react.default.createElement(import_antd.Button, { size: "small", danger: true, icon: /* @__PURE__ */ import_react.default.createElement(import_icons.DeleteOutlined, null) })))
    }
  ];
  return /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement(
    import_antd.Button,
    {
      type: "primary",
      icon: /* @__PURE__ */ import_react.default.createElement(import_icons.PlusOutlined, null),
      style: { marginBottom: 16 },
      onClick: () => {
        setEditing(null);
        setModalOpen(true);
      }
    },
    "New template"
  ), /* @__PURE__ */ import_react.default.createElement(
    import_antd.Table,
    {
      rowKey: "id",
      size: "middle",
      loading,
      dataSource: templates,
      columns,
      locale: { emptyText: /* @__PURE__ */ import_react.default.createElement(import_antd.Empty, { description: "No templates yet. Create your first approval template." }) },
      pagination: false
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    TemplateModal,
    {
      open: modalOpen,
      template: editing,
      api,
      collections,
      roles,
      onClose: () => setModalOpen(false),
      onSaved: load
    }
  ));
}
function GuideTab() {
  return /* @__PURE__ */ import_react.default.createElement("div", { style: { maxWidth: 960 } }, /* @__PURE__ */ import_react.default.createElement(import_antd.Card, { style: { marginBottom: 16 } }, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Paragraph, { strong: true }, "Where is everything?"), /* @__PURE__ */ import_react.default.createElement("ul", null, /* @__PURE__ */ import_react.default.createElement("li", null, "This settings page: ", /* @__PURE__ */ import_react.default.createElement("b", null, "Settings \u2192 Plugin settings \u2192 Simple Approval")), /* @__PURE__ */ import_react.default.createElement("li", null, "Approval Center: ", /* @__PURE__ */ import_react.default.createElement("b", null, "/approval-center")), /* @__PURE__ */ import_react.default.createElement("li", null, "Review page: ", /* @__PURE__ */ import_react.default.createElement("b", null, "/approval/review/:id"), " (open from the Approval Center)"))), /* @__PURE__ */ import_react.default.createElement(import_antd.Card, { style: { marginBottom: 16 } }, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Paragraph, { strong: true }, "Five steps to start approving"), /* @__PURE__ */ import_react.default.createElement(
    import_antd.Steps,
    {
      direction: "vertical",
      current: -1,
      items: [
        {
          title: "Create a template",
          description: 'Click "New template". Give it a name and choose the target collection (for example Purchase Requests).'
        },
        {
          title: "Add approval steps",
          description: "Each step can be assigned to a specific user, multiple users, or a role. Sequential steps run one after another. A parallel step can require all approvers or any one of them."
        },
        {
          title: "(Optional) Map record status",
          description: 'If the target collection has a status field, fill in "Status field" and the values to write on submit / approve / reject / return / cancel.'
        },
        {
          title: "Activate the template",
          description: "Turn the Active switch on. Only one active template per collection is used."
        },
        {
          title: "Add the buttons to your UI",
          description: 'Open any table/details of the target collection \u2192 "Configure actions" \u2192 add "Submit for approval". Approvers can also add Approve / Reject / Return buttons, or use the Approval Center.'
        }
      ]
    }
  )), /* @__PURE__ */ import_react.default.createElement(import_antd.Card, null, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Paragraph, { strong: true }, "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 (\u0639\u0631\u0628\u064A)"), /* @__PURE__ */ import_react.default.createElement("ul", null, /* @__PURE__ */ import_react.default.createElement("li", null, "\u0635\u0641\u062D\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A: ", /* @__PURE__ */ import_react.default.createElement("b", null, "Settings \u2192 Plugin settings \u2192 Simple Approval")), /* @__PURE__ */ import_react.default.createElement("li", null, "\u0623\u0646\u0634\u0626 \u0642\u0627\u0644\u0628 \u0645\u0648\u0627\u0641\u0642\u0629 \u062C\u062F\u064A\u062F\u060C \u0648\u0627\u062E\u062A\u0631 \u0627\u0644\u0640 Collection \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0629\u060C \u0648\u0623\u0636\u0641 \u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 (\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u062D\u062F\u062F / \u0639\u062F\u0629 \u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 / \u062F\u0648\u0631)."), /* @__PURE__ */ import_react.default.createElement("li", null, "\u0634\u063A\u0651\u0644 \u0627\u0644\u0642\u0627\u0644\u0628 (Active) \u2014 \u064A\u064F\u0633\u062A\u062E\u062F\u0645 \u0642\u0627\u0644\u0628 \u0648\u0627\u062D\u062F \u0646\u0634\u0637 \u0644\u0643\u0644 Collection."), /* @__PURE__ */ import_react.default.createElement("li", null, '\u0641\u064A \u0623\u064A \u062C\u062F\u0648\u0644 \u0623\u0648 \u0635\u0641\u062D\u0629 \u062A\u0641\u0627\u0635\u064A\u0644 \u0644\u0644\u0640 Collection: "Configure actions" \u2192 \u0623\u0636\u0641 \u0632\u0631 "Submit for approval".'), /* @__PURE__ */ import_react.default.createElement("li", null, '\u0628\u0639\u062F \u0627\u0644\u0625\u0631\u0633\u0627\u0644: \u064A\u0638\u0647\u0631 \u0627\u0644\u0637\u0644\u0628 \u0641\u064A Approval Center (\u200E/approval-center\u200E) \u0644\u062F\u0649 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0641\u064A "My Approvals".'), /* @__PURE__ */ import_react.default.createElement("li", null, "\u0627\u0644\u0645\u0639\u062A\u0645\u062F \u064A\u0641\u062A\u062D Review \u0648\u064A\u0646\u0641\u0630 Approve \u0623\u0648 Reject (\u0628\u0633\u0628\u0628 \u0625\u0644\u0632\u0627\u0645\u064A) \u0623\u0648 Return (\u0628\u0633\u0628\u0628 \u0625\u0644\u0632\u0627\u0645\u064A)."), /* @__PURE__ */ import_react.default.createElement("li", null, "\u0635\u0627\u062D\u0628 \u0627\u0644\u0637\u0644\u0628 \u064A\u0645\u0643\u0646\u0647 \u0627\u0644\u0625\u0644\u063A\u0627\u0621 (Cancel) \u0645\u0627 \u062F\u0627\u0645 \u0627\u0644\u0637\u0644\u0628 \u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u060C \u0648\u0643\u0644 \u062D\u0631\u0643\u0629 \u062A\u064F\u0633\u062C\u064E\u0651\u0644 \u0641\u064A Timeline."))));
}
function SettingsPage() {
  return /* @__PURE__ */ import_react.default.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ import_react.default.createElement(
    import_antd.Tabs,
    {
      items: [
        { key: "templates", label: "Approval Templates", children: /* @__PURE__ */ import_react.default.createElement(TemplatesTab, null) },
        { key: "guide", label: "How to use", children: /* @__PURE__ */ import_react.default.createElement(GuideTab, null) }
      ]
    }
  ));
}

// src/client/pages/ApprovalCenterPage.tsx
var import_react2 = __toESM(require("react"));
var import_react_router_dom = require("react-router-dom");
var import_antd2 = require("antd");
var import_icons2 = require("@ant-design/icons");
var import_client2 = require("@nocobase/client");
var STATUS_COLORS = {
  pending: "orange",
  in_progress: "processing",
  approved: "success",
  rejected: "error",
  returned: "warning",
  cancelled: "default"
};
function formatDate(v) {
  if (!v) return "";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}
function ApprovalCenterPage() {
  var _a, _b, _c, _d;
  const api = (0, import_client2.useAPIClient)();
  const navigate = (0, import_react_router_dom.useNavigate)();
  const [summary, setSummary] = (0, import_react2.useState)({});
  const [myApprovals, setMyApprovals] = (0, import_react2.useState)([]);
  const [myRequests, setMyRequests] = (0, import_react2.useState)([]);
  const [loading, setLoading] = (0, import_react2.useState)(true);
  const load = (0, import_react2.useCallback)(async () => {
    var _a2, _b2, _c2, _d2, _e, _f, _g;
    setLoading(true);
    try {
      const [s, a, r] = await Promise.all([
        api.request({ url: "approval:summary", method: "GET" }),
        api.request({ url: "approval:myApprovals", method: "GET" }),
        api.request({ url: "approval:myRequests", method: "GET" })
      ]);
      setSummary(((_a2 = s == null ? void 0 : s.data) == null ? void 0 : _a2.data) || {});
      setMyApprovals(((_b2 = a == null ? void 0 : a.data) == null ? void 0 : _b2.data) || []);
      setMyRequests(((_c2 = r == null ? void 0 : r.data) == null ? void 0 : _c2.data) || []);
    } catch (e) {
      import_antd2.message.error(((_g = (_f = (_e = (_d2 = e == null ? void 0 : e.response) == null ? void 0 : _d2.data) == null ? void 0 : _e.errors) == null ? void 0 : _f[0]) == null ? void 0 : _g.message) || (e == null ? void 0 : e.message) || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [api]);
  (0, import_react2.useEffect)(() => {
    load();
  }, [load]);
  const cancelRequest = async (row) => {
    var _a2, _b2, _c2, _d2;
    try {
      await api.request({ url: `approval:cancel/${row.id}`, method: "POST", data: {} });
      import_antd2.message.success("Request cancelled");
      load();
    } catch (e) {
      import_antd2.message.error(((_d2 = (_c2 = (_b2 = (_a2 = e == null ? void 0 : e.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.errors) == null ? void 0 : _c2[0]) == null ? void 0 : _d2.message) || (e == null ? void 0 : e.message) || "Failed");
    }
  };
  const baseColumns = [
    { title: "Request No.", dataIndex: "requestNo", width: 160 },
    { title: "Template", dataIndex: "templateName" },
    { title: "Collection", dataIndex: "targetCollection", width: 160 },
    { title: "Record ID", dataIndex: "targetRecordId", width: 100 },
    {
      title: "Current step",
      dataIndex: "currentStep",
      width: 110,
      render: (v, row) => row.status === "in_progress" ? `#${v}` : "-"
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 130,
      render: (v) => /* @__PURE__ */ import_react2.default.createElement(import_antd2.Tag, { color: STATUS_COLORS[v] || "default" }, v)
    },
    { title: "Submitted at", dataIndex: "submittedAt", width: 180, render: formatDate }
  ];
  const approvalsColumns = [
    ...baseColumns,
    { title: "Submitted by", dataIndex: "submittedByName", width: 140 },
    {
      title: "Action",
      key: "review",
      width: 110,
      render: (_, row) => /* @__PURE__ */ import_react2.default.createElement(import_antd2.Button, { type: "primary", size: "small", onClick: () => navigate(`/approval/review/${row.id}`) }, "Review")
    }
  ];
  const requestsColumns = [
    ...baseColumns,
    {
      title: "Action",
      key: "actions",
      width: 170,
      render: (_, row) => /* @__PURE__ */ import_react2.default.createElement(import_antd2.Space, null, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Button, { size: "small", onClick: () => navigate(`/approval/review/${row.id}`) }, "View"), ["pending", "in_progress"].includes(row.status) && /* @__PURE__ */ import_react2.default.createElement(
        import_antd2.Popconfirm,
        {
          title: "Cancel this approval request?",
          onConfirm: () => cancelRequest(row),
          okText: "Yes",
          cancelText: "No"
        },
        /* @__PURE__ */ import_react2.default.createElement(import_antd2.Button, { size: "small", danger: true }, "Cancel")
      ))
    }
  ];
  return /* @__PURE__ */ import_react2.default.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Typography.Title, { level: 3 }, /* @__PURE__ */ import_react2.default.createElement(import_icons2.AuditOutlined, null), " Approval Center"), /* @__PURE__ */ import_react2.default.createElement(import_antd2.Row, { gutter: 16 }, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Col, { span: 6 }, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Card, null, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Statistic, { title: "Pending my approval", value: (_a = summary.pendingApprovals) != null ? _a : 0, prefix: /* @__PURE__ */ import_react2.default.createElement(import_icons2.InboxOutlined, null) }))), /* @__PURE__ */ import_react2.default.createElement(import_antd2.Col, { span: 6 }, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Card, null, /* @__PURE__ */ import_react2.default.createElement(
    import_antd2.Statistic,
    {
      title: "My requests (in progress)",
      value: (_b = summary.inProgress) != null ? _b : 0,
      prefix: /* @__PURE__ */ import_react2.default.createElement(import_icons2.FileDoneOutlined, null)
    }
  ))), /* @__PURE__ */ import_react2.default.createElement(import_antd2.Col, { span: 6 }, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Card, null, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Statistic, { title: "Approved", value: (_c = summary.approved) != null ? _c : 0, prefix: /* @__PURE__ */ import_react2.default.createElement(import_icons2.CheckCircleOutlined, null) }))), /* @__PURE__ */ import_react2.default.createElement(import_antd2.Col, { span: 6 }, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Card, null, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Statistic, { title: "Rejected", value: (_d = summary.rejected) != null ? _d : 0, prefix: /* @__PURE__ */ import_react2.default.createElement(import_icons2.CloseCircleOutlined, null) })))), /* @__PURE__ */ import_react2.default.createElement(import_antd2.Card, { style: { marginTop: 16 } }, /* @__PURE__ */ import_react2.default.createElement(
    import_antd2.Tabs,
    {
      items: [
        {
          key: "approvals",
          label: `My Approvals (${myApprovals.length})`,
          children: /* @__PURE__ */ import_react2.default.createElement(
            import_antd2.Table,
            {
              rowKey: "id",
              size: "middle",
              loading,
              dataSource: myApprovals,
              columns: approvalsColumns,
              pagination: { pageSize: 10, showSizeChanger: false }
            }
          )
        },
        {
          key: "requests",
          label: `My Requests (${myRequests.length})`,
          children: /* @__PURE__ */ import_react2.default.createElement(
            import_antd2.Table,
            {
              rowKey: "id",
              size: "middle",
              loading,
              dataSource: myRequests,
              columns: requestsColumns,
              pagination: { pageSize: 10, showSizeChanger: false }
            }
          )
        }
      ]
    }
  )));
}

// src/client/pages/ReviewPage.tsx
var import_react3 = __toESM(require("react"));
var import_react_router_dom2 = require("react-router-dom");
var import_antd3 = require("antd");
var import_client3 = require("@nocobase/client");
var STATUS_COLORS2 = {
  pending: "orange",
  in_progress: "processing",
  approved: "success",
  rejected: "error",
  returned: "warning",
  cancelled: "default"
};
var ACTION_COLORS = {
  submitted: "blue",
  approved: "green",
  rejected: "red",
  returned: "orange",
  cancelled: "default"
};
function formatDate2(v) {
  if (!v) return "";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}
function ReviewPage() {
  const api = (0, import_client3.useAPIClient)();
  const navigate = (0, import_react_router_dom2.useNavigate)();
  const params = (0, import_react_router_dom2.useParams)();
  const requestId = params == null ? void 0 : params.id;
  const [data, setData] = (0, import_react3.useState)(null);
  const [loading, setLoading] = (0, import_react3.useState)(true);
  const load = (0, import_react3.useCallback)(async () => {
    var _a, _b, _c, _d, _e;
    if (!requestId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.request({ url: `approval:getRequest/${requestId}`, method: "GET" });
      setData((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data);
    } catch (e) {
      import_antd3.message.error(((_e = (_d = (_c = (_b = e == null ? void 0 : e.response) == null ? void 0 : _b.data) == null ? void 0 : _c.errors) == null ? void 0 : _d[0]) == null ? void 0 : _e.message) || (e == null ? void 0 : e.message) || "Failed to load request");
    } finally {
      setLoading(false);
    }
  }, [api, requestId]);
  (0, import_react3.useEffect)(() => {
    load();
  }, [load]);
  const doAction = (action) => {
    const run = async (reason) => {
      var _a, _b, _c, _d;
      try {
        await api.request({
          url: `approval:${action}/${requestId}`,
          method: "POST",
          data: { reason }
        });
        import_antd3.message.success("Done");
        load();
      } catch (e) {
        import_antd3.message.error(((_d = (_c = (_b = (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.errors) == null ? void 0 : _c[0]) == null ? void 0 : _d.message) || (e == null ? void 0 : e.message) || "Failed");
      }
    };
    if (action !== "reject" && action !== "return") {
      run();
      return;
    }
    let value = "";
    import_antd3.Modal.confirm({
      title: action === "reject" ? "Reject this request" : "Return this request to the submitter",
      okText: action === "reject" ? "Reject" : "Return",
      okButtonProps: action === "reject" ? { danger: true } : void 0,
      cancelText: "Cancel",
      content: import_react3.default.createElement(import_antd3.Input.TextArea, {
        rows: 3,
        placeholder: "Reason (required)",
        onChange: (e) => {
          value = e.target.value;
        }
      }),
      onOk: () => {
        if (!value.trim()) {
          import_antd3.message.warning("A reason is required for this action");
          return false;
        }
        run(value.trim());
        return void 0;
      }
    });
  };
  if (loading) {
    return /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, { style: { margin: 24 } }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Skeleton, { active: true, paragraph: { rows: 8 } }));
  }
  if (!data) {
    return /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, { style: { margin: 24 } }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Typography.Text, { type: "danger" }, "Approval request not found. It may have been removed, or the id is invalid."), /* @__PURE__ */ import_react3.default.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Button, { onClick: () => navigate("/approval-center") }, "Back to Approval Center")));
  }
  const snapshotRows = Object.entries(data.snapshot || {}).filter(([, value]) => value !== null && typeof value !== "object").map(([key, value]) => ({ key, field: key, value: String(value) }));
  return /* @__PURE__ */ import_react3.default.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Space, { align: "center", style: { marginBottom: 16 } }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Typography.Title, { level: 3, style: { margin: 0 } }, data.requestNo), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Tag, { color: STATUS_COLORS2[data.status] || "default" }, data.status)), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, { title: "Request details" }, /* @__PURE__ */ import_react3.default.createElement(
    import_antd3.Descriptions,
    {
      bordered: true,
      size: "small",
      column: 2,
      items: [
        { key: "template", label: "Template", children: data.templateName },
        { key: "collection", label: "Collection", children: data.targetCollection },
        { key: "record", label: "Record", children: `#${data.targetRecordId}` },
        { key: "submittedBy", label: "Submitted by", children: data.submittedByName },
        { key: "submittedAt", label: "Submitted at", children: formatDate2(data.submittedAt) },
        {
          key: "currentStep",
          label: "Current step",
          children: data.status === "in_progress" ? `#${data.currentStep}` : "-"
        },
        { key: "completedAt", label: "Completed at", children: formatDate2(data.completedAt) },
        ...data.rejectionReason ? [{ key: "rejectionReason", label: "Rejection reason", children: data.rejectionReason }] : [],
        ...data.returnReason ? [{ key: "returnReason", label: "Return reason", children: data.returnReason }] : []
      ]
    }
  ), ["pending", "in_progress"].includes(data.status) && /* @__PURE__ */ import_react3.default.createElement(import_antd3.Space, { style: { marginTop: 16 }, wrap: true }, data.canApprove && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Button, { type: "primary", onClick: () => doAction("approve") }, "Approve"), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Button, { danger: true, onClick: () => doAction("reject") }, "Reject"), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Button, { onClick: () => doAction("return") }, "Return")), data.canCancel && /* @__PURE__ */ import_react3.default.createElement(import_antd3.Button, { danger: true, onClick: () => doAction("cancel") }, "Cancel"))), /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" } }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, { title: "Approval steps", style: { flex: "1 1 320px", minWidth: 320 } }, /* @__PURE__ */ import_react3.default.createElement(
    import_antd3.Timeline,
    {
      items: (data.steps || []).map((s) => ({
        color: data.status === "approved" ? "green" : s.stepOrder < data.currentStep ? "green" : s.stepOrder === data.currentStep && data.status === "in_progress" ? "blue" : "gray",
        children: /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("b", null, `Step ${s.stepOrder}: ${s.name}`), /* @__PURE__ */ import_react3.default.createElement("br", null), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Typography.Text, { type: "secondary" }, s.approverType === "user" ? "Specific user" : s.approverType === "users" ? "Multiple users" : "Role", " \xB7 ", s.mode === "parallel" ? "Parallel" : "Sequential", s.mode === "parallel" ? ` \xB7 ${s.completionRule === "any" ? "Any one approver" : "All approvers"}` : ""))
      }))
    }
  )), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, { title: "History", style: { flex: "1 1 320px", minWidth: 320 } }, /* @__PURE__ */ import_react3.default.createElement(
    import_antd3.Timeline,
    {
      items: (data.history || []).map((h, i) => ({
        color: ACTION_COLORS[h.action] || "gray",
        key: i,
        children: /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("b", null, h.action), " \u2014 ", h.actorName, /* @__PURE__ */ import_react3.default.createElement("br", null), h.comment ? /* @__PURE__ */ import_react3.default.createElement(import_antd3.Typography.Text, { type: "secondary" }, h.comment) : null, /* @__PURE__ */ import_react3.default.createElement("br", null), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Typography.Text, { type: "secondary", style: { fontSize: 12 } }, formatDate2(h.createdAt)))
      }))
    }
  )), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, { title: "Record snapshot", style: { flex: "1 1 100%" } }, /* @__PURE__ */ import_react3.default.createElement(
    import_antd3.Table,
    {
      rowKey: "key",
      size: "small",
      dataSource: snapshotRows,
      pagination: false,
      columns: [
        { title: "Field", dataIndex: "field", width: 240 },
        { title: "Value", dataIndex: "value" }
      ]
    }
  ))));
}

// src/client/actions.tsx
var import_react4 = __toESM(require("react"));
var import_antd4 = require("antd");
var import_client4 = require("@nocobase/client");
var import_client5 = require("@nocobase/client");
function getRecordId(record, collection) {
  var _a, _b;
  if (record == null) return null;
  const key = (collection == null ? void 0 : collection.filterTargetKey) || (collection == null ? void 0 : collection.primaryKey) || "id";
  return (_b = (_a = record[key]) != null ? _a : record.id) != null ? _b : null;
}
function errorText(e) {
  var _a, _b, _c, _d, _e, _f, _g;
  return ((_d = (_c = (_b = (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.errors) == null ? void 0 : _c[0]) == null ? void 0 : _d.message) || ((_g = (_f = (_e = e == null ? void 0 : e.response) == null ? void 0 : _e.data) == null ? void 0 : _f.error) == null ? void 0 : _g.message) || (e == null ? void 0 : e.message) || "Request failed";
}
function promptForReason(title, okText) {
  return new Promise((resolve) => {
    let value = "";
    import_antd4.Modal.confirm({
      title,
      okText,
      okButtonProps: okText === "Reject" ? { danger: true } : void 0,
      cancelText: "Cancel",
      content: import_react4.default.createElement(import_antd4.Input.TextArea, {
        rows: 3,
        placeholder: "Reason (required)",
        onChange: (e) => {
          value = e.target.value;
        }
      }),
      onOk: () => {
        if (!value.trim()) {
          import_antd4.message.warning("A reason is required for this action");
          return false;
        }
        resolve(value.trim());
        return void 0;
      },
      onCancel: () => resolve(null)
    });
  });
}
function confirmDialog(title) {
  return new Promise((resolve) => {
    import_antd4.Modal.confirm({
      title,
      okText: "OK",
      cancelText: "Cancel",
      onOk: () => {
        resolve(true);
        return void 0;
      },
      onCancel: () => resolve(false)
    });
  });
}
async function callApproval(api, action, data) {
  return api.resource("approval")[action]({ values: data });
}
function useApprovalContext() {
  var _a;
  const api = (0, import_client4.useAPIClient)();
  const record = (0, import_client4.useRecord)();
  const collection = (0, import_client4.useCollection)();
  let refresh;
  try {
    refresh = (_a = (0, import_client4.useResourceActionContext)()) == null ? void 0 : _a.refresh;
  } catch (e) {
  }
  return { api, record, collection, refresh };
}
function useSubmitForApprovalActionProps() {
  const { api, record, collection, refresh } = useApprovalContext();
  return {
    title: "Submit for approval",
    async onClick() {
      const recordId = getRecordId(record, collection);
      if (recordId == null) {
        import_antd4.message.error("Please use this action on an existing record.");
        return;
      }
      try {
        await callApproval(api, "submit", { collection: collection.name, recordId });
        import_antd4.message.success("Submitted for approval");
        refresh == null ? void 0 : refresh();
      } catch (e) {
        import_antd4.message.error(errorText(e));
      }
    }
  };
}
function useApproveApprovalActionProps() {
  const { api, record, collection, refresh } = useApprovalContext();
  return {
    title: "Approve",
    async onClick() {
      var _a;
      const recordId = getRecordId(record, collection);
      if (recordId == null) return;
      try {
        const res = await callApproval(api, "approve", { collection: collection.name, recordId });
        const data = (_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data;
        if ((data == null ? void 0 : data.status) === "in_progress") {
          import_antd4.message.success("Approved. Waiting for the next approvers.");
        } else {
          import_antd4.message.success("Approved");
        }
        refresh == null ? void 0 : refresh();
      } catch (e) {
        import_antd4.message.error(errorText(e));
      }
    }
  };
}
function useRejectApprovalActionProps() {
  const { api, record, collection, refresh } = useApprovalContext();
  return {
    title: "Reject",
    danger: true,
    async onClick() {
      const recordId = getRecordId(record, collection);
      if (recordId == null) return;
      const reason = await promptForReason("Reject this request", "Reject");
      if (reason == null) return;
      try {
        await callApproval(api, "reject", { collection: collection.name, recordId, reason });
        import_antd4.message.success("Rejected");
        refresh == null ? void 0 : refresh();
      } catch (e) {
        import_antd4.message.error(errorText(e));
      }
    }
  };
}
function useReturnApprovalActionProps() {
  const { api, record, collection, refresh } = useApprovalContext();
  return {
    title: "Return",
    async onClick() {
      const recordId = getRecordId(record, collection);
      if (recordId == null) return;
      const reason = await promptForReason("Return this request to the submitter", "Return");
      if (reason == null) return;
      try {
        await callApproval(api, "return", { collection: collection.name, recordId, reason });
        import_antd4.message.success("Returned to the submitter");
        refresh == null ? void 0 : refresh();
      } catch (e) {
        import_antd4.message.error(errorText(e));
      }
    }
  };
}
function useCancelApprovalActionProps() {
  const { api, record, collection, refresh } = useApprovalContext();
  return {
    title: "Cancel approval",
    danger: true,
    async onClick() {
      const recordId = getRecordId(record, collection);
      if (recordId == null) return;
      const ok = await confirmDialog("Cancel the approval request for this record?");
      if (!ok) return;
      try {
        await callApproval(api, "cancel", { collection: collection.name, recordId });
        import_antd4.message.success("Approval request cancelled");
        refresh == null ? void 0 : refresh();
      } catch (e) {
        import_antd4.message.error(errorText(e));
      }
    }
  };
}
var actionSchema = (scopeName) => ({
  type: "void",
  "x-component": "Action",
  "x-use-component-props": scopeName
});
var approvalActionInitializerItems = {
  submitForApproval: {
    type: "item",
    name: "submitForApproval",
    useComponentProps() {
      const { insert } = (0, import_client5.useSchemaInitializer)();
      return {
        title: "Submit for approval",
        onClick: () => insert(actionSchema("useSubmitForApprovalActionProps"))
      };
    }
  },
  approveApproval: {
    type: "item",
    name: "approveApproval",
    useComponentProps() {
      const { insert } = (0, import_client5.useSchemaInitializer)();
      return {
        title: "Approve",
        onClick: () => insert(actionSchema("useApproveApprovalActionProps"))
      };
    }
  },
  rejectApproval: {
    type: "item",
    name: "rejectApproval",
    useComponentProps() {
      const { insert } = (0, import_client5.useSchemaInitializer)();
      return {
        title: "Reject",
        onClick: () => insert(actionSchema("useRejectApprovalActionProps"))
      };
    }
  },
  returnApproval: {
    type: "item",
    name: "returnApproval",
    useComponentProps() {
      const { insert } = (0, import_client5.useSchemaInitializer)();
      return {
        title: "Return",
        onClick: () => insert(actionSchema("useReturnApprovalActionProps"))
      };
    }
  },
  cancelApproval: {
    type: "item",
    name: "cancelApproval",
    useComponentProps() {
      const { insert } = (0, import_client5.useSchemaInitializer)();
      return {
        title: "Cancel approval",
        onClick: () => insert(actionSchema("useCancelApprovalActionProps"))
      };
    }
  }
};

// src/client/plugin.tsx
var PluginSimpleApprovalClient = class extends import_client6.Plugin {
  async load() {
    this.app.pluginSettingsManager.add("simple-approval", {
      title: this.app.i18n ? this.t("Simple Approval") : "Simple Approval",
      icon: "AuditOutlined",
      Component: SettingsPage,
      sort: 300
    });
    this.app.router.add("approval-center", {
      path: "/approval-center",
      Component: ApprovalCenterPage
    });
    this.app.router.add("approval-review", {
      path: "/approval/review/:id",
      Component: ReviewPage
    });
    this.app.addScopes({
      useSubmitForApprovalActionProps,
      useApproveApprovalActionProps,
      useRejectApprovalActionProps,
      useReturnApprovalActionProps,
      useCancelApprovalActionProps
    });
    for (const [key, item] of Object.entries(approvalActionInitializerItems)) {
      for (const initializer of ["table:configureActions", "details:configureActions"]) {
        try {
          this.app.schemaInitializerManager.addItem(initializer, key, item);
        } catch (e) {
        }
      }
    }
  }
};
var plugin_default = PluginSimpleApprovalClient;

  return module.exports;
});
