"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const vatsimAuthScript = new mongoose_1.default.Schema({
    cid: { type: String, required: true },
    discordID: { type: String, required: true },
    guildID: { type: String, required: true },
    full_vatsim_data: { type: Object, required: true },
    dataType: { type: String, default: 'old' }
});
exports.default = mongoose_1.default.model('vatsimAuth', vatsimAuthScript);
