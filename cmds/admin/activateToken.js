"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_commando_1 = require("discord.js-commando");
const authenticationScript_1 = __importDefault(require("../../api/schema/authenticationScript"));
class activateTokenCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'change-token',
            description: 'Изменяет запрошеный АПИ токен.',
            memberName: 'change-token',
            ownerOnly: true,
            group: 'admin',
            args: [
                {
                    key: 'tokenID',
                    type: 'string',
                    prompt: 'Предоставьте ID токена.'
                },
                {
                    key: 'action',
                    type: 'string',
                    prompt: 'Активировать или деактивировать?'
                }
            ]
        });
    }
    async run(message, { tokenID, action }) {
        const thisToken = await authenticationScript_1.default.findByIdAndUpdate(tokenID, {
            active: action.trim() === 'a' ? true : false
        }, {
            upsert: false
        });
        if (thisToken) {
            return message.reply(`Токен ${thisToken.id} - ${thisToken.allowedSource} был ${action === 'a' ? 'активирован' : 'деактивирован'}.`);
        }
        return message.reply(`Ошибка изменения токена.`);
    }
}
exports.default = activateTokenCommand;
