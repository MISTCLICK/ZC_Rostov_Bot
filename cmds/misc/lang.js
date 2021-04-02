"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const langSchema_1 = __importDefault(require("../../schema/langSchema"));
const discord_js_commando_1 = require("discord.js-commando");
class LangCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'lang',
            memberName: 'lang',
            description: 'Изменяет язык бота.',
            group: 'misc'
        });
    }
    async run(message) {
        const currLang = await langSchema_1.default.findOne({ ver: 0 });
        const newLang = currLang ? currLang.lang === 0 ? 1 : 0 : 0;
        await langSchema_1.default.findOneAndUpdate({ ver: 0 }, { lang: newLang }, { upsert: true });
        return message.reply(newLang === 0 ? 'Язык был изменён на РУССКИЙ.' : 'Language was changed to ENGLISH.');
    }
}
exports.default = LangCommand;
