"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_commando_1 = require("discord.js-commando");
const axios_1 = __importDefault(require("axios"));
class activateTokenCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'new-token',
            description: 'Создаёт новый АПИ токен.',
            memberName: 'new-token',
            ownerOnly: true,
            guildOnly: true,
            group: 'admin',
        });
    }
    async run(message) {
        let res = await axios_1.default.post('http://localhost:5000/access', {
            source: message.guild.id
        });
        if (res.data.success) {
            return message.reply(`Ваш новый АПИ токен был сгенерирован.\n\`\`\`Токен: ${res.data.token}\nКод доступа источника: ${res.data.allowedSource}\`\`\``);
        }
        return message.reply('Произошла ошибка создания токена! Обратитесь к @MISTCLICK#8009');
    }
}
exports.default = activateTokenCommand;
