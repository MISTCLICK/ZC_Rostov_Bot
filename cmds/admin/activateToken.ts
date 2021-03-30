import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import authenticationScript from '../../api/schema/authenticationScript';

interface thisArgs {
  tokenID: string;
  action: string;
}

export default class activateTokenCommand extends Command {
  constructor(client: CommandoClient) {
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

  async run(message: CommandoMessage, { tokenID, action }: thisArgs) {
    const thisToken = await authenticationScript.findByIdAndUpdate(tokenID, {
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