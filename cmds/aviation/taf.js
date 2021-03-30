"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const discord_js_commando_1 = require("discord.js-commando");
class MetarCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'taf',
            description: 'Выдаёт ТАФ аэропорта.',
            memberName: 'taf',
            group: 'aviation',
            aliases: ['t'],
            args: [{
                    key: 'airport',
                    type: 'string',
                    default: '',
                    prompt: 'Предоставьте ИКАО код из 4 букв, пожалуйста!'
                }]
        });
    }
    async run(message, { airport }) {
        try {
            if (airport.length !== 4)
                return message.reply('Предоставьте ИКАО код из 4 букв, пожалуйста!');
            let taf = await axios_1.default.get(`http://metartaf.ru/${airport.toUpperCase()}.json`);
            if (taf.data.taf.slice(20).startsWith('TAF ' + airport.toUpperCase())) {
                let newTaf = taf.data.taf.slice(19);
                return message.reply('```' + newTaf + '```');
            }
            return message.reply('```' + taf.data.taf + '```');
        }
        catch (err) {
            return message.reply('Такой аэропорт не был найден!');
        }
    }
}
exports.default = MetarCommand;
