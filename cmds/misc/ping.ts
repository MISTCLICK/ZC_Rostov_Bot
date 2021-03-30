import { oneLine } from 'common-tags';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

export default class PingCommand extends Command {
	constructor(client: CommandoClient) {
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

	async run(msg: CommandoMessage) {
		const pingMsg = await msg.reply('Пингую...');
		return pingMsg.edit(oneLine`
			${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
			Понг! Процесс отправки сообщения занял ${
				(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)
			}мс.
			${this.client.ws.ping ? `Общий пинг клиента: ${Math.round(this.client.ws.ping)}мс.` : ''}
		`);
	}
};
