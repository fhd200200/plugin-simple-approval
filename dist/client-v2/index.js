!function (root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = factory(require);
  } else if (typeof define === 'function' && define.amd) {
    define("@mhd/plugin-simple-approval/client-v2", ["react","antd","@ant-design/icons","@nocobase/client-v2","@nocobase/flow-engine"], function () {
      var __names = ["react","antd","@ant-design/icons","@nocobase/client-v2","@nocobase/flow-engine"];
      var __map = {};
      for (var __i = 0; __i < __names.length; __i++) __map[__names[__i]] = arguments[__i];
      return factory(function (name) {
        if (name in __map) return __map[name];
        throw new Error('Cannot resolve module: ' + name);
      });
    });
  } else {
    var __globals = {
      "react": root["React"],
      "antd": root["antd"],
      "@ant-design/icons": root["icons"],
      "@nocobase/client-v2": root["client-v2"],
      "@nocobase/flow-engine": root["flow-engine"],
    };
    factory(function (name) {
      if (name in __globals && __globals[name] !== undefined) return __globals[name];
      throw new Error('Cannot resolve module: ' + name);
    });
  }
}(typeof self !== 'undefined' ? self : this, function (require) {
  var module = { exports: {} };
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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

// src/client-v2/locale.ts
function tExpr(key) {
  return (0, import_flow_engine.tExpr)(key, { ns: [NAMESPACE, "client"] });
}
function useT() {
  const engine = (0, import_flow_engine.useFlowEngine)();
  return (str) => {
    var _a, _b, _c;
    return (_c = (_b = (_a = engine == null ? void 0 : engine.context) == null ? void 0 : _a.t) == null ? void 0 : _b.call(_a, str, { ns: [NAMESPACE, "client"] })) != null ? _c : str;
  };
}
var import_flow_engine, NAMESPACE;
var init_locale = __esm({
  "src/client-v2/locale.ts"() {
    import_flow_engine = require("@nocobase/flow-engine");
    NAMESPACE = "@mhd/plugin-simple-approval";
  }
});

// src/client-v2/pages/TemplatesPage.tsx
var TemplatesPage_exports = {};
__export(TemplatesPage_exports, {
  default: () => TemplatesPage
});
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
function StepEditor({ step, index, onChange, onRemove, api, roles, t }) {
  var _a, _b, _c;
  const approverType = step.approverType;
  return /* @__PURE__ */ import_react.default.createElement(import_antd.Card, { size: "small", title: `${t("Step")} ${index + 1}`, extra: /* @__PURE__ */ import_react.default.createElement("a", { onClick: onRemove }, t("Remove")) }, /* @__PURE__ */ import_react.default.createElement(import_antd.Row, { gutter: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Text, { type: "secondary" }, t("Step name")), /* @__PURE__ */ import_react.default.createElement(
    import_antd.Input,
    {
      style: { marginTop: 4 },
      value: step.name,
      placeholder: t("e.g. Manager review"),
      onChange: (e) => onChange({ ...step, name: e.target.value })
    }
  )), /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Text, { type: "secondary" }, t("Approver type")), /* @__PURE__ */ import_react.default.createElement(
    import_antd.Select,
    {
      style: { width: "100%", marginTop: 4 },
      value: step.approverType,
      options: APPROVER_TYPES.map((o) => ({ ...o, label: t(o.label) })),
      onChange: (v) => onChange({ ...step, approverType: v, approverConfig: {} })
    }
  ))), /* @__PURE__ */ import_react.default.createElement("div", { style: { marginTop: 12 } }, approverType === "user" && /* @__PURE__ */ import_react.default.createElement(
    UserSelect,
    {
      api,
      placeholder: t("Select the approver"),
      value: (_a = step.approverConfig) == null ? void 0 : _a.userId,
      onChange: (v) => onChange({ ...step, approverConfig: { ...step.approverConfig, userId: v } })
    }
  ), approverType === "users" && /* @__PURE__ */ import_react.default.createElement(
    UserSelect,
    {
      api,
      multiple: true,
      placeholder: t("Select the approvers"),
      value: (_b = step.approverConfig) == null ? void 0 : _b.userIds,
      onChange: (v) => onChange({ ...step, approverConfig: { ...step.approverConfig, userIds: v } })
    }
  ), approverType === "role" && /* @__PURE__ */ import_react.default.createElement(
    import_antd.Select,
    {
      style: { width: "100%" },
      showSearch: true,
      allowClear: true,
      placeholder: t("Select a role"),
      value: (_c = step.approverConfig) == null ? void 0 : _c.roleName,
      onChange: (v) => onChange({ ...step, approverConfig: { ...step.approverConfig, roleName: v } }),
      options: roles.map((r) => ({ value: r.name, label: r.title || r.name }))
    }
  )), /* @__PURE__ */ import_react.default.createElement(import_antd.Row, { gutter: 12, style: { marginTop: 12 } }, /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Text, { type: "secondary" }, t("Mode")), /* @__PURE__ */ import_react.default.createElement(
    import_antd.Select,
    {
      style: { width: "100%", marginTop: 4 },
      value: step.mode,
      options: MODES.map((o) => ({ ...o, label: t(o.label) })),
      onChange: (v) => onChange({ ...step, mode: v })
    }
  )), /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Text, { type: "secondary" }, t("Completion rule")), /* @__PURE__ */ import_react.default.createElement(
    import_antd.Select,
    {
      style: { width: "100%", marginTop: 4 },
      value: step.completionRule,
      options: COMPLETION_RULES.map((o) => ({ ...o, label: t(o.label) })),
      onChange: (v) => onChange({ ...step, completionRule: v })
    }
  ))));
}
function TemplateModal({ open, template, onClose, onSaved, api, collections, roles, t }) {
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
      import_antd.message.warning(t("Add at least one step"));
      return;
    }
    for (const s of steps) {
      if (!s.name.trim()) {
        import_antd.message.warning(t("Every step needs a name"));
        return;
      }
    }
    setSaving(true);
    try {
      const payload = { ...values, steps };
      if (template) {
        await api.request({ url: `approval:updateTemplate/${template.id}`, method: "POST", data: payload });
      } else {
        await api.request({ url: "approval:createTemplate", method: "POST", data: payload });
      }
      import_antd.message.success(t("Template saved"));
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
      title: template ? `${t("Edit template")}: ${template.name}` : t("New approval template"),
      onCancel: onClose,
      onOk: () => form.submit(),
      okText: t("Save"),
      cancelText: t("Cancel"),
      confirmLoading: saving,
      width: 760,
      destroyOnClose: true
    },
    /* @__PURE__ */ import_react.default.createElement(import_antd.Form, { form, layout: "vertical", onFinish: save }, /* @__PURE__ */ import_react.default.createElement(import_antd.Row, { gutter: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Form.Item, { name: "name", label: t("Template name"), rules: [{ required: true }] }, /* @__PURE__ */ import_react.default.createElement(import_antd.Input, { placeholder: "Purchase request approval" }))), /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 12 }, /* @__PURE__ */ import_react.default.createElement(import_antd.Form.Item, { name: "targetCollection", label: t("Target collection"), rules: [{ required: true }] }, /* @__PURE__ */ import_react.default.createElement(
      import_antd.Select,
      {
        showSearch: true,
        allowClear: true,
        options: collections.map((c) => ({ value: c.name, label: `${c.title} (${c.name})` }))
      }
    )))), /* @__PURE__ */ import_react.default.createElement(import_antd.Form.Item, { name: "description", label: t("Description") }, /* @__PURE__ */ import_react.default.createElement(import_antd.Input.TextArea, { rows: 2 })), /* @__PURE__ */ import_react.default.createElement(import_antd.Card, { size: "small", title: t("Write status back to the record (optional)"), style: { marginBottom: 16 } }, /* @__PURE__ */ import_react.default.createElement(
      import_antd.Form.Item,
      {
        name: "statusField",
        label: t("Status field on the target collection"),
        tooltip: t(
          "Optional. When set, the plugin writes the mapped values below into this field of the business record."
        )
      },
      /* @__PURE__ */ import_react.default.createElement(import_antd.Input, { placeholder: "status" })
    ), /* @__PURE__ */ import_react.default.createElement(import_antd.Row, { gutter: 8 }, STATUS_EVENTS.map((event) => /* @__PURE__ */ import_react.default.createElement(import_antd.Col, { span: 8, key: event.key }, /* @__PURE__ */ import_react.default.createElement(import_antd.Form.Item, { name: ["statusMapping", event.key], label: t(event.label), initialValue: "" }, /* @__PURE__ */ import_react.default.createElement(import_antd.Input, { placeholder: "e.g. pending" })))))), /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Title, { level: 5 }, t("Approval steps")), /* @__PURE__ */ import_react.default.createElement(import_antd.Space, { direction: "vertical", style: { width: "100%" }, size: 12 }, steps.map((step, index) => /* @__PURE__ */ import_react.default.createElement(
      StepEditor,
      {
        key: index,
        step,
        index,
        api,
        roles,
        t,
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
      t("Add step")
    ), /* @__PURE__ */ import_react.default.createElement(import_antd.Form.Item, { name: "active", label: t("Active"), valuePropName: "checked", style: { marginTop: 16 } }, /* @__PURE__ */ import_react.default.createElement(import_antd.Switch, null)), /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Text, { type: "secondary" }, t("Only one active template is used per collection. Activating this one deactivates the others.")))
  );
}
function TemplatesPage() {
  const ctx = (0, import_flow_engine2.useFlowContext)();
  const t = useT();
  const api = ctx == null ? void 0 : ctx.api;
  const [templates, setTemplates] = (0, import_react.useState)([]);
  const [collections, setCollections] = (0, import_react.useState)([]);
  const [roles, setRoles] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [modalOpen, setModalOpen] = (0, import_react.useState)(false);
  const [editing, setEditing] = (0, import_react.useState)(null);
  const load = (0, import_react.useCallback)(async () => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!api) return;
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
      import_antd.message.success(t("Template deleted"));
      load();
    } catch (e) {
      import_antd.message.error(((_d = (_c = (_b = (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.errors) == null ? void 0 : _c[0]) == null ? void 0 : _d.message) || (e == null ? void 0 : e.message) || "Failed");
    }
  };
  if (!api) {
    return /* @__PURE__ */ import_react.default.createElement(import_antd.Card, { style: { margin: 24 } }, /* @__PURE__ */ import_react.default.createElement(import_antd.Typography.Paragraph, null, "This page must be opened through the NocoBase settings router."));
  }
  const columns = [
    { title: t("Name"), dataIndex: "name" },
    { title: t("Target collection"), dataIndex: "targetCollection" },
    { title: t("Steps"), dataIndex: "steps", width: 90, render: (v) => (v || []).length },
    { title: t("Version"), dataIndex: "version", width: 90 },
    {
      title: t("Active"),
      dataIndex: "active",
      width: 100,
      render: (v, row) => /* @__PURE__ */ import_react.default.createElement(import_antd.Switch, { checked: v, onChange: () => toggleActive(row) })
    },
    {
      title: t("Actions"),
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
      ), /* @__PURE__ */ import_react.default.createElement(import_antd.Popconfirm, { title: t("Delete this template?"), onConfirm: () => remove(row), okText: t("Yes"), cancelText: t("No") }, /* @__PURE__ */ import_react.default.createElement(import_antd.Button, { size: "small", danger: true, icon: /* @__PURE__ */ import_react.default.createElement(import_icons.DeleteOutlined, null) })))
    }
  ];
  return /* @__PURE__ */ import_react.default.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ import_react.default.createElement(
    import_antd.Tabs,
    {
      items: [
        {
          key: "templates",
          label: t("Approval Templates"),
          children: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(
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
            t("New template")
          ), /* @__PURE__ */ import_react.default.createElement(
            import_antd.Table,
            {
              rowKey: "id",
              size: "middle",
              loading,
              dataSource: templates,
              columns,
              locale: {
                emptyText: /* @__PURE__ */ import_react.default.createElement(import_antd.Empty, { description: t("No templates yet. Create your first approval template.") })
              },
              pagination: false
            }
          ))
        }
      ]
    }
  ), /* @__PURE__ */ import_react.default.createElement(
    TemplateModal,
    {
      open: modalOpen,
      template: editing,
      api,
      collections,
      roles,
      t,
      onClose: () => setModalOpen(false),
      onSaved: load
    }
  ));
}
var import_react, import_antd, import_icons, import_flow_engine2, APPROVER_TYPES, MODES, COMPLETION_RULES, STATUS_EVENTS;
var init_TemplatesPage = __esm({
  "src/client-v2/pages/TemplatesPage.tsx"() {
    import_react = __toESM(require("react"));
    import_antd = require("antd");
    import_icons = require("@ant-design/icons");
    import_flow_engine2 = require("@nocobase/flow-engine");
    init_locale();
    APPROVER_TYPES = [
      { value: "user", label: "Specific user" },
      { value: "users", label: "Multiple users" },
      { value: "role", label: "Role" }
    ];
    MODES = [
      { value: "sequential", label: "Sequential" },
      { value: "parallel", label: "Parallel" }
    ];
    COMPLETION_RULES = [
      { value: "all", label: "All approvers must approve" },
      { value: "any", label: "Any one approver is enough" }
    ];
    STATUS_EVENTS = [
      { key: "submitted", label: "On submit" },
      { key: "approved", label: "On approved" },
      { key: "rejected", label: "On rejected" },
      { key: "returned", label: "On returned" },
      { key: "cancelled", label: "On cancelled" }
    ];
  }
});

// src/client-v2/pages/GuidePage.tsx
var GuidePage_exports = {};
__export(GuidePage_exports, {
  default: () => GuidePage
});
function GuidePage() {
  const t = useT();
  return /* @__PURE__ */ import_react2.default.createElement("div", { style: { padding: 24, maxWidth: 960 } }, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Typography.Title, { level: 3 }, t("How to use Simple Approval")), /* @__PURE__ */ import_react2.default.createElement(import_antd2.Card, { style: { marginBottom: 16 } }, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Typography.Paragraph, { strong: true }, t("Where is everything?")), /* @__PURE__ */ import_react2.default.createElement("ul", null, /* @__PURE__ */ import_react2.default.createElement("li", null, t("This settings page"), ": ", /* @__PURE__ */ import_react2.default.createElement("b", null, t("Settings \u2192 Plugin settings \u2192 Simple Approval"))), /* @__PURE__ */ import_react2.default.createElement("li", null, t("Approval Center (dashboard)"), ": ", /* @__PURE__ */ import_react2.default.createElement("b", null, "/v/approval-center")), /* @__PURE__ */ import_react2.default.createElement("li", null, t("Review page"), ": ", /* @__PURE__ */ import_react2.default.createElement("b", null, "/v/approval/review/:id")))), /* @__PURE__ */ import_react2.default.createElement(import_antd2.Card, { style: { marginBottom: 16 } }, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Typography.Paragraph, { strong: true }, t("Five steps to start approving")), /* @__PURE__ */ import_react2.default.createElement(
    import_antd2.Steps,
    {
      direction: "vertical",
      current: -1,
      items: [
        {
          title: t("Create a template"),
          description: t(
            'On the "Approval Templates" tab, click "New template". Give it a name and choose the target collection (for example Purchase Requests).'
          )
        },
        {
          title: t("Add approval steps"),
          description: t(
            "Each step can be assigned to a specific user, multiple users, or a role. Sequential steps run one after another. A parallel step can require all approvers or any one of them."
          )
        },
        {
          title: t("(Optional) Map record status"),
          description: t(
            'If the target collection has a status field, fill in "Status field" and the values to write on submit / approve / reject / return / cancel.'
          )
        },
        {
          title: t("Activate the template"),
          description: t(
            "Turn the Active switch on. Only one active template per collection is used."
          )
        },
        {
          title: t("Add the buttons to your UI"),
          description: t(
            'Open any table/block of the target collection \u2192 "Configure actions" \u2192 add "Submit for approval". Approvers can also add "Approve / Reject / Return" buttons the same way, or use the Approval Center.'
          )
        }
      ]
    }
  )), /* @__PURE__ */ import_react2.default.createElement(import_antd2.Card, { style: { marginBottom: 16 } }, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Typography.Paragraph, { strong: true }, t("Daily usage")), /* @__PURE__ */ import_react2.default.createElement("ul", null, /* @__PURE__ */ import_react2.default.createElement("li", null, t('A user opens a record and clicks "Submit for approval". A snapshot of the record is stored.')), /* @__PURE__ */ import_react2.default.createElement("li", null, t('Approvers see the request in the Approval Center under "My Approvals" and open the review page.')), /* @__PURE__ */ import_react2.default.createElement("li", null, t("They can Approve, Reject (reason required) or Return it to the submitter (reason required).")), /* @__PURE__ */ import_react2.default.createElement("li", null, t("The submitter can cancel while the request is still in progress.")), /* @__PURE__ */ import_react2.default.createElement("li", null, t("Every action is recorded in the history timeline of the request.")))), /* @__PURE__ */ import_react2.default.createElement(import_antd2.Card, null, /* @__PURE__ */ import_react2.default.createElement(import_antd2.Typography.Paragraph, { strong: true }, "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 (\u0639\u0631\u0628\u064A)"), /* @__PURE__ */ import_react2.default.createElement("ul", null, /* @__PURE__ */ import_react2.default.createElement("li", null, "\u0635\u0641\u062D\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A: ", /* @__PURE__ */ import_react2.default.createElement("b", null, "Settings \u2192 Plugin settings \u2192 Simple Approval")), /* @__PURE__ */ import_react2.default.createElement("li", null, "\u0623\u0646\u0634\u0626 \u0642\u0627\u0644\u0628 \u0645\u0648\u0627\u0641\u0642\u0629 \u062C\u062F\u064A\u062F\u060C \u0648\u0627\u062E\u062A\u0631 \u0627\u0644\u0640 Collection \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0629\u060C \u0648\u0623\u0636\u0641 \u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 (\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u062D\u062F\u062F / \u0639\u062F\u0629 \u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 / \u062F\u0648\u0631)."), /* @__PURE__ */ import_react2.default.createElement("li", null, "\u0634\u063A\u0651\u0644 \u0627\u0644\u0642\u0627\u0644\u0628 (Active) \u2014 \u064A\u064F\u0633\u062A\u062E\u062F\u0645 \u0642\u0627\u0644\u0628 \u0648\u0627\u062D\u062F \u0646\u0634\u0637 \u0644\u0643\u0644 Collection."), /* @__PURE__ */ import_react2.default.createElement("li", null, '\u0641\u064A \u0623\u064A \u062C\u062F\u0648\u0644 \u0623\u0648 \u0635\u0641\u062D\u0629 \u062A\u0641\u0627\u0635\u064A\u0644 \u0644\u0644\u0640 Collection: "Configure actions" \u2192 \u0623\u0636\u0641 \u0632\u0631 "Submit for approval".'), /* @__PURE__ */ import_react2.default.createElement("li", null, '\u0628\u0639\u062F \u0627\u0644\u0625\u0631\u0633\u0627\u0644: \u064A\u0638\u0647\u0631 \u0627\u0644\u0637\u0644\u0628 \u0641\u064A Approval Center (\u200E/v/approval-center\u200E) \u0644\u062F\u0649 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0641\u064A "My Approvals".'), /* @__PURE__ */ import_react2.default.createElement("li", null, "\u0627\u0644\u0645\u0639\u062A\u0645\u062F \u064A\u0641\u062A\u062D Review \u0648\u064A\u0646\u0641\u0630 Approve \u0623\u0648 Reject (\u0628\u0633\u0628\u0628 \u0625\u0644\u0632\u0627\u0645\u064A) \u0623\u0648 Return (\u0628\u0633\u0628\u0628 \u0625\u0644\u0632\u0627\u0645\u064A)."), /* @__PURE__ */ import_react2.default.createElement("li", null, "\u0635\u0627\u062D\u0628 \u0627\u0644\u0637\u0644\u0628 \u064A\u0645\u0643\u0646\u0647 \u0627\u0644\u0625\u0644\u063A\u0627\u0621 (Cancel) \u0645\u0627 \u062F\u0627\u0645 \u0627\u0644\u0637\u0644\u0628 \u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u060C \u0648\u0643\u0644 \u062D\u0631\u0643\u0629 \u062A\u064F\u0633\u062C\u064E\u0651\u0644 \u0641\u064A Timeline."))));
}
var import_react2, import_antd2;
var init_GuidePage = __esm({
  "src/client-v2/pages/GuidePage.tsx"() {
    import_react2 = __toESM(require("react"));
    import_antd2 = require("antd");
    init_locale();
  }
});

// src/client-v2/pages/ApprovalCenterPage.tsx
var ApprovalCenterPage_exports = {};
__export(ApprovalCenterPage_exports, {
  default: () => ApprovalCenterPage
});
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
  const ctx = (0, import_flow_engine3.useFlowContext)();
  const t = useT();
  const [summary, setSummary] = (0, import_react3.useState)({});
  const [myApprovals, setMyApprovals] = (0, import_react3.useState)([]);
  const [myRequests, setMyRequests] = (0, import_react3.useState)([]);
  const [loading, setLoading] = (0, import_react3.useState)(true);
  const api = ctx == null ? void 0 : ctx.api;
  const load = (0, import_react3.useCallback)(async () => {
    var _a2, _b2, _c2, _d2, _e, _f, _g;
    if (!api) return;
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
      import_antd3.message.error(((_g = (_f = (_e = (_d2 = e == null ? void 0 : e.response) == null ? void 0 : _d2.data) == null ? void 0 : _e.errors) == null ? void 0 : _f[0]) == null ? void 0 : _g.message) || (e == null ? void 0 : e.message) || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [api]);
  (0, import_react3.useEffect)(() => {
    load();
  }, [load]);
  const cancelRequest = async (row) => {
    var _a2, _b2, _c2, _d2;
    try {
      await api.request({ url: `approval:cancel/${row.id}`, method: "POST", data: {} });
      import_antd3.message.success(t("Request cancelled"));
      load();
    } catch (e) {
      import_antd3.message.error(((_d2 = (_c2 = (_b2 = (_a2 = e == null ? void 0 : e.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.errors) == null ? void 0 : _c2[0]) == null ? void 0 : _d2.message) || (e == null ? void 0 : e.message) || "Failed");
    }
  };
  const openReview = (row) => {
    var _a2, _b2;
    return (_b2 = (_a2 = ctx == null ? void 0 : ctx.router) == null ? void 0 : _a2.navigate) == null ? void 0 : _b2.call(_a2, `/approval/review/${row.id}`);
  };
  const baseColumns = [
    { title: t("Request No."), dataIndex: "requestNo", width: 160 },
    { title: t("Template"), dataIndex: "templateName" },
    { title: t("Collection"), dataIndex: "targetCollection", width: 160 },
    { title: t("Record ID"), dataIndex: "targetRecordId", width: 100 },
    {
      title: t("Current step"),
      dataIndex: "currentStep",
      width: 110,
      render: (v, row) => row.status === "in_progress" ? `#${v}` : "-"
    },
    {
      title: t("Status"),
      dataIndex: "status",
      width: 130,
      render: (v) => /* @__PURE__ */ import_react3.default.createElement(import_antd3.Tag, { color: STATUS_COLORS[v] || "default" }, v)
    },
    { title: t("Submitted at"), dataIndex: "submittedAt", width: 180, render: formatDate }
  ];
  const approvalsColumns = [
    ...baseColumns,
    { title: t("Submitted by"), dataIndex: "submittedByName", width: 140 },
    {
      title: t("Action"),
      key: "review",
      width: 110,
      render: (_, row) => /* @__PURE__ */ import_react3.default.createElement(import_antd3.Button, { type: "primary", size: "small", onClick: () => openReview(row) }, t("Review"))
    }
  ];
  const requestsColumns = [
    ...baseColumns,
    {
      title: t("Action"),
      key: "actions",
      width: 170,
      render: (_, row) => /* @__PURE__ */ import_react3.default.createElement(import_antd3.Space, null, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Button, { size: "small", onClick: () => openReview(row) }, t("View")), ["pending", "in_progress"].includes(row.status) && /* @__PURE__ */ import_react3.default.createElement(
        import_antd3.Popconfirm,
        {
          title: t("Cancel this approval request?"),
          onConfirm: () => cancelRequest(row),
          okText: t("Yes"),
          cancelText: t("No")
        },
        /* @__PURE__ */ import_react3.default.createElement(import_antd3.Button, { size: "small", danger: true }, t("Cancel"))
      ))
    }
  ];
  if (!api) {
    return /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, { style: { margin: 24 } }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Typography.Paragraph, null, "This page must be opened through the NocoBase router (/v/approval-center)."));
  }
  return /* @__PURE__ */ import_react3.default.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Typography.Title, { level: 3 }, /* @__PURE__ */ import_react3.default.createElement(import_icons2.AuditOutlined, null), " ", t("Approval Center")), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Row, { gutter: 16 }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Col, { span: 6 }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, null, /* @__PURE__ */ import_react3.default.createElement(
    import_antd3.Statistic,
    {
      title: t("Pending my approval"),
      value: (_a = summary.pendingApprovals) != null ? _a : 0,
      prefix: /* @__PURE__ */ import_react3.default.createElement(import_icons2.InboxOutlined, null)
    }
  ))), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Col, { span: 6 }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, null, /* @__PURE__ */ import_react3.default.createElement(
    import_antd3.Statistic,
    {
      title: t("My requests (in progress)"),
      value: (_b = summary.inProgress) != null ? _b : 0,
      prefix: /* @__PURE__ */ import_react3.default.createElement(import_icons2.FileDoneOutlined, null)
    }
  ))), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Col, { span: 6 }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, null, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Statistic, { title: t("Approved"), value: (_c = summary.approved) != null ? _c : 0, prefix: /* @__PURE__ */ import_react3.default.createElement(import_icons2.CheckCircleOutlined, null) }))), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Col, { span: 6 }, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, null, /* @__PURE__ */ import_react3.default.createElement(import_antd3.Statistic, { title: t("Rejected"), value: (_d = summary.rejected) != null ? _d : 0, prefix: /* @__PURE__ */ import_react3.default.createElement(import_icons2.CloseCircleOutlined, null) })))), /* @__PURE__ */ import_react3.default.createElement(import_antd3.Card, { style: { marginTop: 16 } }, /* @__PURE__ */ import_react3.default.createElement(
    import_antd3.Tabs,
    {
      items: [
        {
          key: "approvals",
          label: `${t("My Approvals")} (${myApprovals.length})`,
          children: /* @__PURE__ */ import_react3.default.createElement(
            import_antd3.Table,
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
          label: `${t("My Requests")} (${myRequests.length})`,
          children: /* @__PURE__ */ import_react3.default.createElement(
            import_antd3.Table,
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
var import_react3, import_antd3, import_icons2, import_flow_engine3, STATUS_COLORS;
var init_ApprovalCenterPage = __esm({
  "src/client-v2/pages/ApprovalCenterPage.tsx"() {
    import_react3 = __toESM(require("react"));
    import_antd3 = require("antd");
    import_icons2 = require("@ant-design/icons");
    import_flow_engine3 = require("@nocobase/flow-engine");
    init_locale();
    STATUS_COLORS = {
      pending: "orange",
      in_progress: "processing",
      approved: "success",
      rejected: "error",
      returned: "warning",
      cancelled: "default"
    };
  }
});

// src/client-v2/pages/ReviewPage.tsx
var ReviewPage_exports = {};
__export(ReviewPage_exports, {
  default: () => ReviewPage
});
function formatDate2(v) {
  if (!v) return "";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}
function ReviewPage() {
  var _a, _b;
  const ctx = (0, import_flow_engine4.useFlowContext)();
  const t = useT();
  const [data, setData] = (0, import_react4.useState)(null);
  const [loading, setLoading] = (0, import_react4.useState)(true);
  const requestId = (_b = (_a = ctx == null ? void 0 : ctx.route) == null ? void 0 : _a.params) == null ? void 0 : _b.id;
  const api = ctx == null ? void 0 : ctx.api;
  const load = (0, import_react4.useCallback)(async () => {
    var _a2, _b2, _c, _d, _e;
    if (!api || !requestId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.request({ url: `approval:getRequest/${requestId}`, method: "GET" });
      setData((_a2 = res == null ? void 0 : res.data) == null ? void 0 : _a2.data);
    } catch (e) {
      import_antd4.message.error(((_e = (_d = (_c = (_b2 = e == null ? void 0 : e.response) == null ? void 0 : _b2.data) == null ? void 0 : _c.errors) == null ? void 0 : _d[0]) == null ? void 0 : _e.message) || (e == null ? void 0 : e.message) || "Failed to load request");
    } finally {
      setLoading(false);
    }
  }, [api, requestId]);
  (0, import_react4.useEffect)(() => {
    load();
  }, [load]);
  const doAction = (action) => {
    const needsReason = action === "reject" || action === "return";
    const run = async (reason) => {
      var _a2, _b2, _c, _d;
      try {
        await api.request({
          url: `approval:${action}/${requestId}`,
          method: "POST",
          data: { reason }
        });
        import_antd4.message.success(t("Done"));
        load();
      } catch (e) {
        import_antd4.message.error(((_d = (_c = (_b2 = (_a2 = e == null ? void 0 : e.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.errors) == null ? void 0 : _c[0]) == null ? void 0 : _d.message) || (e == null ? void 0 : e.message) || "Failed");
      }
    };
    if (!needsReason) {
      run();
      return;
    }
    let value = "";
    import_antd4.Modal.confirm({
      title: action === "reject" ? t("Reject this request") : t("Return this request to the submitter"),
      okText: action === "reject" ? t("Reject") : t("Return"),
      okButtonProps: action === "reject" ? { danger: true } : void 0,
      cancelText: t("Cancel"),
      content: import_react4.default.createElement(import_antd4.Input.TextArea, {
        rows: 3,
        placeholder: t("Reason (required)"),
        onChange: (e) => {
          value = e.target.value;
        }
      }),
      onOk: () => {
        if (!value.trim()) {
          import_antd4.message.warning(t("A reason is required for this action"));
          return false;
        }
        run(value.trim());
        return void 0;
      }
    });
  };
  if (loading) {
    return /* @__PURE__ */ import_react4.default.createElement(import_antd4.Card, { style: { margin: 24 } }, /* @__PURE__ */ import_react4.default.createElement(import_antd4.Skeleton, { active: true, paragraph: { rows: 8 } }));
  }
  if (!data) {
    return /* @__PURE__ */ import_react4.default.createElement(import_antd4.Card, { style: { margin: 24 } }, /* @__PURE__ */ import_react4.default.createElement(import_antd4.Typography.Text, { type: "danger" }, t("Approval request not found. It may have been removed, or the id is invalid.")));
  }
  const snapshotRows = Object.entries(data.snapshot || {}).filter(([key, value]) => value !== null && typeof value !== "object").map(([key, value]) => ({ key, field: key, value: String(value) }));
  return /* @__PURE__ */ import_react4.default.createElement("div", { style: { padding: 24 } }, /* @__PURE__ */ import_react4.default.createElement(import_antd4.Space, { align: "center", style: { marginBottom: 16 } }, /* @__PURE__ */ import_react4.default.createElement(import_antd4.Typography.Title, { level: 3, style: { margin: 0 } }, data.requestNo), /* @__PURE__ */ import_react4.default.createElement(import_antd4.Tag, { color: STATUS_COLORS2[data.status] || "default" }, data.status)), /* @__PURE__ */ import_react4.default.createElement(import_antd4.Card, { title: t("Request details") }, /* @__PURE__ */ import_react4.default.createElement(
    import_antd4.Descriptions,
    {
      bordered: true,
      size: "small",
      column: 2,
      items: [
        { key: "template", label: t("Template"), children: data.templateName },
        { key: "collection", label: t("Collection"), children: data.targetCollection },
        {
          key: "record",
          label: t("Record"),
          children: /* @__PURE__ */ import_react4.default.createElement(
            "a",
            {
              href: `#${data.targetCollection}/${data.targetRecordId}`,
              onClick: (e) => {
                var _a2, _b2;
                e.preventDefault();
                (_b2 = (_a2 = ctx == null ? void 0 : ctx.router) == null ? void 0 : _a2.navigate) == null ? void 0 : _b2.call(_a2, `/admin/${data.targetCollection}/${data.targetRecordId}`);
              }
            },
            "#",
            data.targetRecordId
          )
        },
        { key: "submittedBy", label: t("Submitted by"), children: data.submittedByName },
        { key: "submittedAt", label: t("Submitted at"), children: formatDate2(data.submittedAt) },
        { key: "currentStep", label: t("Current step"), children: data.status === "in_progress" ? `#${data.currentStep}` : "-" },
        { key: "completedAt", label: t("Completed at"), children: formatDate2(data.completedAt) },
        ...data.rejectionReason ? [{ key: "rejectionReason", label: t("Rejection reason"), children: data.rejectionReason }] : [],
        ...data.returnReason ? [{ key: "returnReason", label: t("Return reason"), children: data.returnReason }] : []
      ]
    }
  ), ["pending", "in_progress"].includes(data.status) && /* @__PURE__ */ import_react4.default.createElement(import_antd4.Space, { style: { marginTop: 16 }, wrap: true }, data.canApprove && /* @__PURE__ */ import_react4.default.createElement(import_react4.default.Fragment, null, /* @__PURE__ */ import_react4.default.createElement(import_antd4.Button, { type: "primary", onClick: () => doAction("approve") }, t("Approve")), /* @__PURE__ */ import_react4.default.createElement(import_antd4.Button, { danger: true, onClick: () => doAction("reject") }, t("Reject")), /* @__PURE__ */ import_react4.default.createElement(import_antd4.Button, { onClick: () => doAction("return") }, t("Return"))), data.canCancel && /* @__PURE__ */ import_react4.default.createElement(import_antd4.Button, { danger: true, onClick: () => doAction("cancel") }, t("Cancel")))), /* @__PURE__ */ import_react4.default.createElement(RowCards, { data, t, snapshotRows }));
}
function RowCards({ data, t, snapshotRows }) {
  return /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" } }, /* @__PURE__ */ import_react4.default.createElement(import_antd4.Card, { title: t("Approval steps"), style: { flex: "1 1 320px", minWidth: 320 } }, /* @__PURE__ */ import_react4.default.createElement(
    import_antd4.Timeline,
    {
      items: (data.steps || []).map((s, index) => ({
        color: data.status === "approved" ? "green" : s.stepOrder < data.currentStep ? "green" : s.stepOrder === data.currentStep && data.status === "in_progress" ? "blue" : "gray",
        children: /* @__PURE__ */ import_react4.default.createElement(import_react4.default.Fragment, null, /* @__PURE__ */ import_react4.default.createElement("b", null, `${t("Step")} ${s.stepOrder}: ${s.name}`), /* @__PURE__ */ import_react4.default.createElement("br", null), /* @__PURE__ */ import_react4.default.createElement(import_antd4.Typography.Text, { type: "secondary" }, s.approverType === "user" ? t("Specific user") : s.approverType === "users" ? t("Multiple users") : t("Role"), " \xB7 ", s.mode === "parallel" ? t("Parallel") : t("Sequential"), s.mode === "parallel" ? ` \xB7 ${s.completionRule === "any" ? t("Any one approver") : t("All approvers")}` : ""))
      }))
    }
  )), /* @__PURE__ */ import_react4.default.createElement(import_antd4.Card, { title: t("History"), style: { flex: "1 1 320px", minWidth: 320 } }, /* @__PURE__ */ import_react4.default.createElement(
    import_antd4.Timeline,
    {
      items: (data.history || []).map((h, i) => ({
        color: ACTION_COLORS[h.action] || "gray",
        children: /* @__PURE__ */ import_react4.default.createElement(import_react4.default.Fragment, null, /* @__PURE__ */ import_react4.default.createElement("b", null, h.action), " \u2014 ", h.actorName, /* @__PURE__ */ import_react4.default.createElement("br", null), h.comment ? /* @__PURE__ */ import_react4.default.createElement(import_antd4.Typography.Text, { type: "secondary" }, h.comment) : null, /* @__PURE__ */ import_react4.default.createElement("br", null), /* @__PURE__ */ import_react4.default.createElement(import_antd4.Typography.Text, { type: "secondary", style: { fontSize: 12 } }, formatDate2(h.createdAt))),
        key: i
      }))
    }
  )), /* @__PURE__ */ import_react4.default.createElement(import_antd4.Card, { title: t("Record snapshot"), style: { flex: "1 1 100%" } }, /* @__PURE__ */ import_react4.default.createElement(
    import_antd4.Table,
    {
      rowKey: "key",
      size: "small",
      dataSource: snapshotRows,
      pagination: false,
      columns: [
        { title: t("Field"), dataIndex: "field", width: 240 },
        { title: t("Value"), dataIndex: "value" }
      ]
    }
  )));
}
var import_react4, import_antd4, import_flow_engine4, STATUS_COLORS2, ACTION_COLORS;
var init_ReviewPage = __esm({
  "src/client-v2/pages/ReviewPage.tsx"() {
    import_react4 = __toESM(require("react"));
    import_antd4 = require("antd");
    import_flow_engine4 = require("@nocobase/flow-engine");
    init_locale();
    STATUS_COLORS2 = {
      pending: "orange",
      in_progress: "processing",
      approved: "success",
      rejected: "error",
      returned: "warning",
      cancelled: "default"
    };
    ACTION_COLORS = {
      submitted: "blue",
      approved: "green",
      rejected: "red",
      returned: "orange",
      cancelled: "default"
    };
  }
});

// src/client-v2/models/utils.tsx
function getRecordContext(ctx) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  const record = (_f = (_e = (_b = ctx == null ? void 0 : ctx.record) != null ? _b : typeof ((_a = ctx == null ? void 0 : ctx.blockModel) == null ? void 0 : _a.getCurrentRecord) === "function" ? ctx.blockModel.getCurrentRecord() : null) != null ? _e : (_d = (_c = ctx == null ? void 0 : ctx.model) == null ? void 0 : _c.context) == null ? void 0 : _d.record) != null ? _f : null;
  const collection = (_n = (_m = (_j = (_g = ctx == null ? void 0 : ctx.collection) == null ? void 0 : _g.name) != null ? _j : (_i = (_h = ctx == null ? void 0 : ctx.blockModel) == null ? void 0 : _h.collection) == null ? void 0 : _i.name) != null ? _m : (_l = (_k = ctx == null ? void 0 : ctx.model) == null ? void 0 : _k.collection) == null ? void 0 : _l.name) != null ? _n : null;
  return { record, collection };
}
function resolveRecordId(ctx, record) {
  var _a, _b, _c, _d;
  if (record == null) return null;
  if (record.id != null) return record.id;
  const viaTk = (_d = typeof ((_a = ctx == null ? void 0 : ctx.collection) == null ? void 0 : _a.getFilterByTK) === "function" && ctx.collection.getFilterByTK(record)) != null ? _d : typeof ((_c = (_b = ctx == null ? void 0 : ctx.model) == null ? void 0 : _b.collection) == null ? void 0 : _c.getFilterByTK) === "function" && ctx.model.collection.getFilterByTK(record);
  return viaTk != null ? viaTk : null;
}
function callApproval(ctx, action, data, id) {
  const url = id != null ? `approval:${action}/${id}` : `approval:${action}`;
  return ctx.api.request({ url, method: "POST", data: data || {} });
}
function showError(ctx, e) {
  var _a, _b, _c, _d, _e, _f;
  const text = ((_d = (_c = (_b = (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.errors) == null ? void 0 : _c[0]) == null ? void 0 : _d.message) || ((_f = (_e = e == null ? void 0 : e.response) == null ? void 0 : _e.data) == null ? void 0 : _f.error) || (e == null ? void 0 : e.message) || "Request failed";
  try {
    ctx.message.error(ctx.t ? ctx.t(String(text)) : String(text));
  } catch {
    import_antd5.message.error(String(text));
  }
}
function promptForReason(title, okText, t) {
  return new Promise((resolve) => {
    let value = "";
    import_antd5.Modal.confirm({
      title,
      okText,
      cancelText: t("Cancel"),
      content: import_react5.default.createElement(import_antd5.Input.TextArea, {
        rows: 3,
        placeholder: t("Reason (required)"),
        onChange: (e) => {
          value = e.target.value;
        }
      }),
      onOk: () => {
        if (!value.trim()) {
          import_antd5.message.warning(t("A reason is required for this action"));
          return false;
        }
        resolve(value.trim());
        return void 0;
      },
      onCancel: () => resolve(null)
    });
  });
}
function confirmAction(title, t) {
  return new Promise((resolve) => {
    import_antd5.Modal.confirm({
      title,
      okText: t("OK"),
      cancelText: t("Cancel"),
      onOk: () => {
        resolve(true);
        return void 0;
      },
      onCancel: () => resolve(false)
    });
  });
}
var import_react5, import_antd5, ns;
var init_utils = __esm({
  "src/client-v2/models/utils.tsx"() {
    import_react5 = __toESM(require("react"));
    import_antd5 = require("antd");
    init_locale();
    ns = NAMESPACE;
  }
});

// src/client-v2/models/SubmitForApprovalAction.tsx
var SubmitForApprovalAction_exports = {};
__export(SubmitForApprovalAction_exports, {
  SubmitForApprovalAction: () => SubmitForApprovalAction,
  registerActionGroups: () => registerActionGroups
});
function registerActionGroups(flowEngine) {
  ["RecordActionGroupModel", "FormActionGroupModel", "PopupSubTableFormActionGroupModel"].forEach(
    (modelName) => {
      var _a, _b;
      (_b = (_a = flowEngine.getModelClass(modelName)) == null ? void 0 : _a.registerActionModels) == null ? void 0 : _b.call(_a, { SubmitForApprovalAction });
    }
  );
}
var import_client_v2, SubmitForApprovalAction;
var init_SubmitForApprovalAction = __esm({
  "src/client-v2/models/SubmitForApprovalAction.tsx"() {
    import_client_v2 = require("@nocobase/client-v2");
    init_locale();
    init_utils();
    SubmitForApprovalAction = class extends import_client_v2.ActionModel {
      constructor() {
        super(...arguments);
        this.defaultProps = {
          title: tExpr("Submit for approval")
        };
      }
    };
    SubmitForApprovalAction.scene = import_client_v2.ActionSceneEnum.record;
    SubmitForApprovalAction.define({
      label: tExpr("Submit for approval"),
      sort: 2e3,
      createModelOptions: {
        use: "SubmitForApprovalAction"
      }
    });
    SubmitForApprovalAction.registerFlow({
      key: "submitForApproval",
      on: "click",
      title: tExpr("Submit for approval"),
      steps: {
        doSubmit: {
          async handler(ctx) {
            try {
              const { record, collection } = getRecordContext(ctx);
              if (!record || !collection) {
                ctx.message.error(ctx.t("Please use this action inside a record block", { ns }));
                ctx.exit();
                return;
              }
              const recordId = resolveRecordId(ctx, record);
              await callApproval(ctx, "submit", { collection, recordId });
              ctx.message.success(ctx.t("Submitted for approval", { ns }));
            } catch (e) {
              showError(ctx, e);
              ctx.exit();
            }
          }
        }
      }
    });
  }
});

// src/client-v2/models/ApproveApprovalAction.tsx
var ApproveApprovalAction_exports = {};
__export(ApproveApprovalAction_exports, {
  ApproveApprovalAction: () => ApproveApprovalAction,
  registerActionGroups: () => registerActionGroups2
});
function registerActionGroups2(flowEngine) {
  ["RecordActionGroupModel", "FormActionGroupModel", "PopupSubTableFormActionGroupModel"].forEach(
    (modelName) => {
      var _a, _b;
      (_b = (_a = flowEngine.getModelClass(modelName)) == null ? void 0 : _a.registerActionModels) == null ? void 0 : _b.call(_a, { ApproveApprovalAction });
    }
  );
}
var import_client_v22, ApproveApprovalAction;
var init_ApproveApprovalAction = __esm({
  "src/client-v2/models/ApproveApprovalAction.tsx"() {
    import_client_v22 = require("@nocobase/client-v2");
    init_locale();
    init_utils();
    ApproveApprovalAction = class extends import_client_v22.ActionModel {
      constructor() {
        super(...arguments);
        this.defaultProps = {
          title: tExpr("Approve"),
          type: "primary"
        };
      }
    };
    ApproveApprovalAction.scene = import_client_v22.ActionSceneEnum.record;
    ApproveApprovalAction.define({
      label: tExpr("Approve"),
      sort: 2100,
      createModelOptions: {
        use: "ApproveApprovalAction"
      }
    });
    ApproveApprovalAction.registerFlow({
      key: "approveApproval",
      on: "click",
      title: tExpr("Approve"),
      steps: {
        doApprove: {
          async handler(ctx) {
            var _a;
            try {
              const { record, collection } = getRecordContext(ctx);
              if (!record || !collection) {
                ctx.message.error(ctx.t("Please use this action inside a record block", { ns }));
                ctx.exit();
                return;
              }
              const recordId = resolveRecordId(ctx, record);
              const res = await callApproval(ctx, "approve", { collection, recordId });
              const data = (_a = res == null ? void 0 : res.data) == null ? void 0 : _a.data;
              if ((data == null ? void 0 : data.status) === "in_progress") {
                ctx.message.success(ctx.t("Approved. Waiting for the next approvers.", { ns }));
              } else {
                ctx.message.success(ctx.t("Approved", { ns }));
              }
            } catch (e) {
              showError(ctx, e);
              ctx.exit();
            }
          }
        }
      }
    });
  }
});

// src/client-v2/models/RejectApprovalAction.tsx
var RejectApprovalAction_exports = {};
__export(RejectApprovalAction_exports, {
  RejectApprovalAction: () => RejectApprovalAction,
  registerActionGroups: () => registerActionGroups3
});
function registerActionGroups3(flowEngine) {
  ["RecordActionGroupModel", "FormActionGroupModel", "PopupSubTableFormActionGroupModel"].forEach(
    (modelName) => {
      var _a, _b;
      (_b = (_a = flowEngine.getModelClass(modelName)) == null ? void 0 : _a.registerActionModels) == null ? void 0 : _b.call(_a, { RejectApprovalAction });
    }
  );
}
var import_client_v23, RejectApprovalAction;
var init_RejectApprovalAction = __esm({
  "src/client-v2/models/RejectApprovalAction.tsx"() {
    import_client_v23 = require("@nocobase/client-v2");
    init_locale();
    init_utils();
    RejectApprovalAction = class extends import_client_v23.ActionModel {
      constructor() {
        super(...arguments);
        this.defaultProps = {
          title: tExpr("Reject"),
          danger: true
        };
      }
    };
    RejectApprovalAction.scene = import_client_v23.ActionSceneEnum.record;
    RejectApprovalAction.define({
      label: tExpr("Reject"),
      sort: 2200,
      createModelOptions: {
        use: "RejectApprovalAction"
      }
    });
    RejectApprovalAction.registerFlow({
      key: "rejectApproval",
      on: "click",
      title: tExpr("Reject"),
      steps: {
        doReject: {
          async handler(ctx) {
            try {
              const { record, collection } = getRecordContext(ctx);
              if (!record || !collection) {
                ctx.message.error(ctx.t("Please use this action inside a record block", { ns }));
                ctx.exit();
                return;
              }
              const t = (s) => ctx.t ? ctx.t(s, { ns }) : s;
              const reason = await promptForReason(t("Reject this request"), t("Reject"), t);
              if (reason == null) {
                ctx.exit();
                return;
              }
              const recordId = resolveRecordId(ctx, record);
              await callApproval(ctx, "reject", { collection, recordId, reason });
              ctx.message.success(ctx.t("Rejected", { ns }));
            } catch (e) {
              showError(ctx, e);
              ctx.exit();
            }
          }
        }
      }
    });
  }
});

// src/client-v2/models/ReturnApprovalAction.tsx
var ReturnApprovalAction_exports = {};
__export(ReturnApprovalAction_exports, {
  ReturnApprovalAction: () => ReturnApprovalAction,
  registerActionGroups: () => registerActionGroups4
});
function registerActionGroups4(flowEngine) {
  ["RecordActionGroupModel", "FormActionGroupModel", "PopupSubTableFormActionGroupModel"].forEach(
    (modelName) => {
      var _a, _b;
      (_b = (_a = flowEngine.getModelClass(modelName)) == null ? void 0 : _a.registerActionModels) == null ? void 0 : _b.call(_a, { ReturnApprovalAction });
    }
  );
}
var import_client_v24, ReturnApprovalAction;
var init_ReturnApprovalAction = __esm({
  "src/client-v2/models/ReturnApprovalAction.tsx"() {
    import_client_v24 = require("@nocobase/client-v2");
    init_locale();
    init_utils();
    ReturnApprovalAction = class extends import_client_v24.ActionModel {
      constructor() {
        super(...arguments);
        this.defaultProps = {
          title: tExpr("Return")
        };
      }
    };
    ReturnApprovalAction.scene = import_client_v24.ActionSceneEnum.record;
    ReturnApprovalAction.define({
      label: tExpr("Return"),
      sort: 2300,
      createModelOptions: {
        use: "ReturnApprovalAction"
      }
    });
    ReturnApprovalAction.registerFlow({
      key: "returnApproval",
      on: "click",
      title: tExpr("Return"),
      steps: {
        doReturn: {
          async handler(ctx) {
            try {
              const { record, collection } = getRecordContext(ctx);
              if (!record || !collection) {
                ctx.message.error(ctx.t("Please use this action inside a record block", { ns }));
                ctx.exit();
                return;
              }
              const t = (s) => ctx.t ? ctx.t(s, { ns }) : s;
              const reason = await promptForReason(t("Return this request to the submitter"), t("Return"), t);
              if (reason == null) {
                ctx.exit();
                return;
              }
              const recordId = resolveRecordId(ctx, record);
              await callApproval(ctx, "return", { collection, recordId, reason });
              ctx.message.success(ctx.t("Returned to the submitter", { ns }));
            } catch (e) {
              showError(ctx, e);
              ctx.exit();
            }
          }
        }
      }
    });
  }
});

// src/client-v2/models/CancelApprovalAction.tsx
var CancelApprovalAction_exports = {};
__export(CancelApprovalAction_exports, {
  CancelApprovalAction: () => CancelApprovalAction,
  registerActionGroups: () => registerActionGroups5
});
function registerActionGroups5(flowEngine) {
  ["RecordActionGroupModel", "FormActionGroupModel", "PopupSubTableFormActionGroupModel"].forEach(
    (modelName) => {
      var _a, _b;
      (_b = (_a = flowEngine.getModelClass(modelName)) == null ? void 0 : _a.registerActionModels) == null ? void 0 : _b.call(_a, { CancelApprovalAction });
    }
  );
}
var import_client_v25, CancelApprovalAction;
var init_CancelApprovalAction = __esm({
  "src/client-v2/models/CancelApprovalAction.tsx"() {
    import_client_v25 = require("@nocobase/client-v2");
    init_locale();
    init_utils();
    CancelApprovalAction = class extends import_client_v25.ActionModel {
      constructor() {
        super(...arguments);
        this.defaultProps = {
          title: tExpr("Cancel approval"),
          danger: true
        };
      }
    };
    CancelApprovalAction.scene = import_client_v25.ActionSceneEnum.record;
    CancelApprovalAction.define({
      label: tExpr("Cancel approval"),
      sort: 2400,
      createModelOptions: {
        use: "CancelApprovalAction"
      }
    });
    CancelApprovalAction.registerFlow({
      key: "cancelApproval",
      on: "click",
      title: tExpr("Cancel approval"),
      steps: {
        doCancel: {
          async handler(ctx) {
            try {
              const { record, collection } = getRecordContext(ctx);
              if (!record || !collection) {
                ctx.message.error(ctx.t("Please use this action inside a record block", { ns }));
                ctx.exit();
                return;
              }
              const t = (s) => ctx.t ? ctx.t(s, { ns }) : s;
              const ok = await confirmAction(t("Cancel the approval request for this record?"), t);
              if (!ok) {
                ctx.exit();
                return;
              }
              const recordId = resolveRecordId(ctx, record);
              await callApproval(ctx, "cancel", { collection, recordId });
              ctx.message.success(ctx.t("Approval request cancelled", { ns }));
            } catch (e) {
              showError(ctx, e);
              ctx.exit();
            }
          }
        }
      }
    });
  }
});

// src/client-v2/index.tsx
var client_v2_exports = {};
__export(client_v2_exports, {
  PluginSimpleApprovalClientV2: () => PluginSimpleApprovalClientV2,
  default: () => plugin_default
});
module.exports = __toCommonJS(client_v2_exports);

// src/client-v2/plugin.tsx
var import_client_v26 = require("@nocobase/client-v2");
var PluginSimpleApprovalClientV2 = class extends import_client_v26.Plugin {
  async load() {
    this.pluginSettingsManager.addMenuItem({
      key: "simple-approval",
      title: this.t("Simple Approval"),
      icon: "AuditOutlined",
      sort: 300
    });
    this.pluginSettingsManager.addPageTabItem({
      menuKey: "simple-approval",
      key: "index",
      title: this.t("Approval Templates"),
      componentLoader: () => Promise.resolve().then(() => (init_TemplatesPage(), TemplatesPage_exports))
    });
    this.pluginSettingsManager.addPageTabItem({
      menuKey: "simple-approval",
      key: "guide",
      title: this.t("How to use"),
      componentLoader: () => Promise.resolve().then(() => (init_GuidePage(), GuidePage_exports))
    });
    this.router.add("approval-center", {
      path: "/approval-center",
      componentLoader: () => Promise.resolve().then(() => (init_ApprovalCenterPage(), ApprovalCenterPage_exports))
    });
    this.router.add("approval-review", {
      path: "/approval/review/:id",
      componentLoader: () => Promise.resolve().then(() => (init_ReviewPage(), ReviewPage_exports))
    });
    const registerGroups = (module2) => {
      var _a;
      try {
        (_a = module2 == null ? void 0 : module2.registerActionGroups) == null ? void 0 : _a.call(module2, this.app.flowEngine);
      } catch (e) {
      }
    };
    this.app.flowEngine.registerModelLoaders({
      SubmitForApprovalAction: {
        extends: "ActionModel",
        loader: async () => {
          const module2 = await Promise.resolve().then(() => (init_SubmitForApprovalAction(), SubmitForApprovalAction_exports));
          registerGroups(module2);
          return module2.SubmitForApprovalAction;
        }
      },
      ApproveApprovalAction: {
        extends: "ActionModel",
        loader: async () => {
          const module2 = await Promise.resolve().then(() => (init_ApproveApprovalAction(), ApproveApprovalAction_exports));
          registerGroups(module2);
          return module2.ApproveApprovalAction;
        }
      },
      RejectApprovalAction: {
        extends: "ActionModel",
        loader: async () => {
          const module2 = await Promise.resolve().then(() => (init_RejectApprovalAction(), RejectApprovalAction_exports));
          registerGroups(module2);
          return module2.RejectApprovalAction;
        }
      },
      ReturnApprovalAction: {
        extends: "ActionModel",
        loader: async () => {
          const module2 = await Promise.resolve().then(() => (init_ReturnApprovalAction(), ReturnApprovalAction_exports));
          registerGroups(module2);
          return module2.ReturnApprovalAction;
        }
      },
      CancelApprovalAction: {
        extends: "ActionModel",
        loader: async () => {
          const module2 = await Promise.resolve().then(() => (init_CancelApprovalAction(), CancelApprovalAction_exports));
          registerGroups(module2);
          return module2.CancelApprovalAction;
        }
      }
    });
  }
};
var plugin_default = PluginSimpleApprovalClientV2;

  return module.exports;
});
