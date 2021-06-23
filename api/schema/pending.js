"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const pendingUserSchema = new mongoose_1.default.Schema({
    discordUserID: { type: String, required: true },
    guildID: { type: String, required: true },
    code: { type: String, required: false, default: '' },
    expires: { type: Number, required: true }
});
exports.default = mongoose_1.default.model('pending', pendingUserSchema);
