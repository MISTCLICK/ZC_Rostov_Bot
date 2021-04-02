"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const langSchema = new mongoose_1.default.Schema({
    lang: { type: Number, default: 0 },
    ver: { type: Number, default: 0 }
});
exports.default = mongoose_1.default.model('bot_lang', langSchema);
