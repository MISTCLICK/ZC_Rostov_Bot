"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const mongoose_1 = __importDefault(require("mongoose"));
const warnScript = new mongoose_1.default.Schema({
    guildID: { type: String, required: true },
    userID: { type: String, required: true },
    warns: { type: [Object], required: true }
});
module.exports = mongoose_1.default.model('warns', warnScript);
