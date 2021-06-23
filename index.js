"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importStar(require("./client"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const moment_1 = __importDefault(require("moment"));
const config_json_1 = require("./config.json");
client_1.setupClient();
client_1.default.login(config_json_1.token);
process.on('uncaughtException', (err) => fs_1.default.appendFileSync(path_1.default.join('log', `${moment_1.default(new Date().getTime()).utc().format('DD.MM.YYYY')}_log.txt`), `At ${moment_1.default(new Date().getTime()).utc().format('DD.MM.YYYY HH:mm:ss')} - ${err.toString()}\n`));
process.on('unhandledRejection', (err) => fs_1.default.appendFileSync(path_1.default.join('log', `${moment_1.default(new Date().getTime()).utc().format('DD.MM.YYYY')}_log.txt`), `At ${moment_1.default(new Date().getTime()).utc().format('DD.MM.YYYY HH:mm:ss')} - ${err?.toString()}\n` || `Some promise was rejected at ${moment_1.default(new Date().getTime()).utc().format('DD.MM.YYYY HH:mm:ss')}\n`));
