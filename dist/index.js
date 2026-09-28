"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalError = exports.ApprovalEngine = exports.default = void 0;
var plugin_1 = require("./server/plugin");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(plugin_1).default; } });
var approval_engine_1 = require("./server/services/approval-engine");
Object.defineProperty(exports, "ApprovalEngine", { enumerable: true, get: function () { return approval_engine_1.ApprovalEngine; } });
Object.defineProperty(exports, "ApprovalError", { enumerable: true, get: function () { return approval_engine_1.ApprovalError; } });
