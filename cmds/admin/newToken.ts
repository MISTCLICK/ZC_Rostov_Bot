import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import axios, { AxiosResponse } from 'axios';

interface APIresponse {
  success: true;
  token: string;
  allowedSource: string;
  message: string;
}

interface ErrorAPIresponse {
  success: false;
  message: string;
}

export default class activateTokenCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'new-token',
      description: 'Создаёт новый АПИ токен.',
      memberName: 'new-token',
      ownerOnly: true,
      guildOnly: true,
      group: 'admin',
    });
  }

  async run(message: CommandoMessage) {
    let res = await axios.post<any, AxiosResponse<APIresponse | ErrorAPIresponse>>('https://api.veuroexpress.org:2087/access', {
      source: message.guild.id
    });

    if (res.data.success) {
      return message.reply(`Ваш новый АПИ токен был сгенерирован.\n\`\`\`Токен: ${res.data.token}\nКод доступа источника: ${res.data.allowedSource}\`\`\``);
    }

    return message.reply('Произошла ошибка создания токена! Обратитесь к @MISTCLICK#8009');
  }
}