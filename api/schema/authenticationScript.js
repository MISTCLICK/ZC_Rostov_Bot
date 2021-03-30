"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const authorizationSchema = new mongoose_1.default.Schema({
    token: { type: String, required: true },
    allowedSource: { type: String, required: true },
    privileges: { type: Number, default: 0 },
    active: { type: Boolean, default: false }
});
exports.default = mongoose_1.default.model('tokens', authorizationSchema);
