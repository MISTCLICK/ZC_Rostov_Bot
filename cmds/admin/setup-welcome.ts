import { MessageCollector } from 'discord.js';
import Commando from 'discord.js-commando';
import welcomeScript from '../../schema/welcomeScript';

export default class SetupCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'setup-welcome',
      group: 'admin',
      memberName: 'setup-welcome',
      description: 'Позволяет настроить систему оповещений о входе/выходе с сервера.',
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_MESSAGES'],
      guildOnly: true
    });
  }

  async run(message: Commando.CommandoMessage) {
    const questions = [
      'Тэгните канал, где будут объявляться входы на сервер.',
      'Введите текст приветственного сообщения.',
      'Тэгните роль, которая будет выдаваться всем входящим (напишите "N" если не хотите иметь такую роль).',
      'Тэгните канал, где будут объявляться выходы с сервера.',
      'Введите текст прощального сообщения.'
    ];
    let counter = 0;
    const guildID = message.guild.id;
    const filter = (m: Commando.CommandoMessage) => m.author.id === message.author.id;
    //@ts-ignore
    const collector = new MessageCollector(message.channel, filter, {
      max: questions.length,
      time: 1000 * 120
    });
    
    message.channel.send(questions[counter++]);
    collector.on('collect', async m => {
      if (counter < questions.length) {
        m.channel.send(questions[counter++]);
      }
    });
    
    collector.on('end', async collected => {
      const collectedArr = collected.array();
      if (collectedArr.length < questions.length) return message.reply('Недостаточно информации.');
    
      let welcomeRoleID;
      if (collectedArr[2].content === 'N') {
        //@ts-ignore
        welcomeRoleID = null; 
      } else {
        welcomeRoleID = collectedArr[2].content.slice(3, -1);
      }
    
      const settingsObj = {
        welcome: {
          channelID: collectedArr[0].content.slice(2, -1),
          text: collectedArr[1].content,
          role: welcomeRoleID
        },
        leave: {
          channelID: collectedArr[3].content.slice(2, -1),
          text: collectedArr[4].content
        }
      }
    
      await welcomeScript.findOneAndUpdate({
        guildID
      }, {
        guildID,
        //@ts-ignore
        settingsObj
      }, {
        upsert: true,
        useFindAndModify: false
      }).catch(err => console.error(err));
      return message.reply('Настройка была завершена успешно.');
    });
    return null;
  }
}


