"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const antd_1 = require("antd");
const locale_1 = require("../locale");
function GuidePage() {
    const t = (0, locale_1.useT)();
    return (react_1.default.createElement("div", { style: { padding: 24, maxWidth: 960 } },
        react_1.default.createElement(antd_1.Typography.Title, { level: 3 }, t('How to use Simple Approval')),
        react_1.default.createElement(antd_1.Card, { style: { marginBottom: 16 } },
            react_1.default.createElement(antd_1.Typography.Paragraph, { strong: true }, t('Where is everything?')),
            react_1.default.createElement("ul", null,
                react_1.default.createElement("li", null,
                    t('This settings page'),
                    ": ",
                    react_1.default.createElement("b", null, t('Settings → Plugin settings → Simple Approval'))),
                react_1.default.createElement("li", null,
                    t('Approval Center (dashboard)'),
                    ": ",
                    react_1.default.createElement("b", null, "/v/approval-center")),
                react_1.default.createElement("li", null,
                    t('Review page'),
                    ": ",
                    react_1.default.createElement("b", null, "/v/approval/review/:id")))),
        react_1.default.createElement(antd_1.Card, { style: { marginBottom: 16 } },
            react_1.default.createElement(antd_1.Typography.Paragraph, { strong: true }, t('Five steps to start approving')),
            react_1.default.createElement(antd_1.Steps, { direction: "vertical", current: -1, items: [
                    {
                        title: t('Create a template'),
                        description: t('On the "Approval Templates" tab, click "New template". Give it a name and choose the target collection (for example Purchase Requests).'),
                    },
                    {
                        title: t('Add approval steps'),
                        description: t('Each step can be assigned to a specific user, multiple users, or a role. Sequential steps run one after another. A parallel step can require all approvers or any one of them.'),
                    },
                    {
                        title: t('(Optional) Map record status'),
                        description: t('If the target collection has a status field, fill in "Status field" and the values to write on submit / approve / reject / return / cancel.'),
                    },
                    {
                        title: t('Activate the template'),
                        description: t('Turn the Active switch on. Only one active template per collection is used.'),
                    },
                    {
                        title: t('Add the buttons to your UI'),
                        description: t('Open any table/block of the target collection → "Configure actions" → add "Submit for approval". Approvers can also add "Approve / Reject / Return" buttons the same way, or use the Approval Center.'),
                    },
                ] })),
        react_1.default.createElement(antd_1.Card, { style: { marginBottom: 16 } },
            react_1.default.createElement(antd_1.Typography.Paragraph, { strong: true }, t('Daily usage')),
            react_1.default.createElement("ul", null,
                react_1.default.createElement("li", null, t('A user opens a record and clicks "Submit for approval". A snapshot of the record is stored.')),
                react_1.default.createElement("li", null, t('Approvers see the request in the Approval Center under "My Approvals" and open the review page.')),
                react_1.default.createElement("li", null, t('They can Approve, Reject (reason required) or Return it to the submitter (reason required).')),
                react_1.default.createElement("li", null, t('The submitter can cancel while the request is still in progress.')),
                react_1.default.createElement("li", null, t('Every action is recorded in the history timeline of the request.')))),
        react_1.default.createElement(antd_1.Card, null,
            react_1.default.createElement(antd_1.Typography.Paragraph, { strong: true }, "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 (\u0639\u0631\u0628\u064A)"),
            react_1.default.createElement("ul", null,
                react_1.default.createElement("li", null,
                    "\u0635\u0641\u062D\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A: ",
                    react_1.default.createElement("b", null, "Settings \u2192 Plugin settings \u2192 Simple Approval")),
                react_1.default.createElement("li", null, "\u0623\u0646\u0634\u0626 \u0642\u0627\u0644\u0628 \u0645\u0648\u0627\u0641\u0642\u0629 \u062C\u062F\u064A\u062F\u060C \u0648\u0627\u062E\u062A\u0631 \u0627\u0644\u0640 Collection \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0629\u060C \u0648\u0623\u0636\u0641 \u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 (\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u062D\u062F\u062F / \u0639\u062F\u0629 \u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 / \u062F\u0648\u0631)."),
                react_1.default.createElement("li", null, "\u0634\u063A\u0651\u0644 \u0627\u0644\u0642\u0627\u0644\u0628 (Active) \u2014 \u064A\u064F\u0633\u062A\u062E\u062F\u0645 \u0642\u0627\u0644\u0628 \u0648\u0627\u062D\u062F \u0646\u0634\u0637 \u0644\u0643\u0644 Collection."),
                react_1.default.createElement("li", null, "\u0641\u064A \u0623\u064A \u062C\u062F\u0648\u0644 \u0623\u0648 \u0635\u0641\u062D\u0629 \u062A\u0641\u0627\u0635\u064A\u0644 \u0644\u0644\u0640 Collection: \"Configure actions\" \u2192 \u0623\u0636\u0641 \u0632\u0631 \"Submit for approval\"."),
                react_1.default.createElement("li", null, "\u0628\u0639\u062F \u0627\u0644\u0625\u0631\u0633\u0627\u0644: \u064A\u0638\u0647\u0631 \u0627\u0644\u0637\u0644\u0628 \u0641\u064A Approval Center (\u200E/v/approval-center\u200E) \u0644\u062F\u0649 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0641\u064A \"My Approvals\"."),
                react_1.default.createElement("li", null, "\u0627\u0644\u0645\u0639\u062A\u0645\u062F \u064A\u0641\u062A\u062D Review \u0648\u064A\u0646\u0641\u0630 Approve \u0623\u0648 Reject (\u0628\u0633\u0628\u0628 \u0625\u0644\u0632\u0627\u0645\u064A) \u0623\u0648 Return (\u0628\u0633\u0628\u0628 \u0625\u0644\u0632\u0627\u0645\u064A)."),
                react_1.default.createElement("li", null, "\u0635\u0627\u062D\u0628 \u0627\u0644\u0637\u0644\u0628 \u064A\u0645\u0643\u0646\u0647 \u0627\u0644\u0625\u0644\u063A\u0627\u0621 (Cancel) \u0645\u0627 \u062F\u0627\u0645 \u0627\u0644\u0637\u0644\u0628 \u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u060C \u0648\u0643\u0644 \u062D\u0631\u0643\u0629 \u062A\u064F\u0633\u062C\u064E\u0651\u0644 \u0641\u064A Timeline.")))));
}
exports.default = GuidePage;
