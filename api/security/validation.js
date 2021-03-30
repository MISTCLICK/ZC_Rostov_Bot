"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cfg_json_1 = require("./cfg.json");
const authenticationScript_1 = __importDefault(require("../schema/authenticationScript"));
async function validate(key, source) {
    let factor = false;
    let tokenWritten = await authenticationScript_1.default.findOne({
        token: key
    });
    if (tokenWritten && tokenWritten.allowedSource === source && tokenWritten.active && cfg_json_1.allowedSources.find(s => s === source) ? true : false)
        factor = true;
    return factor;
}
exports.default = validate;
