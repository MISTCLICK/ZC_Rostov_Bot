"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_commando_1 = require("discord.js-commando");
class PingCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'misc',
            memberName: 'ping',
            description: 'Проверяет пинг бота.',
            throttling: {
                usages: 5,
                duration: 10
            }
        });
    }
    async run(msg) {
        const pingMsg = await msg.reply('Пингую...');
        return pingMsg.edit(common_tags_1.oneLine `
			${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
			Понг! Процесс отправки сообщения занял ${(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)}мс.
			${this.client.ws.ping ? `Общий пинг клиента: ${Math.round(this.client.ws.ping)}мс.` : ''}
		`);
    }
}
exports.default = PingCommand;
;
