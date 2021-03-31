import Commando, { CommandoMessage } from 'discord.js-commando';
import moment from 'moment';
import muteScript from '../../schema/muteScript';

export = class MuteCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'mute',
      group: 'admin',
      memberName: 'mute',
      description: 'Позволяет замутить пользователя',
      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['MANAGE_MESSAGES', 'MUTE_MEMBERS'],
      argsType: 'multiple',
      guildOnly: true
    });
  }

  //@ts-ignore
  async run (message: CommandoMessage, args: string[]) {
    interface muteUnit {
      author: string,
      timeStamp: Date,
      duration: Date,
      reason: string
    }
    const target = message.mentions.users.first();
    if (!target) return;
    args.shift();

    const guildID = message.guild.id;
    const userID = target.id;
    const durationRaw = args[0];
    args.shift();
    const reason = args.join(' ');

    if (!durationRaw || !reason) return message.reply('Неправильные аргументы команды!'); 

    const duration = new Date();
    if (durationRaw.endsWith('d')) {
      const durationAI = durationRaw.slice(0, -1);
      const durationInt = parseInt(durationAI, 10);
      const durationHrs = durationInt * 24;
      duration.setHours(duration.getHours() + durationHrs);
    } else if (durationRaw.endsWith('m')) {
      const durationAI = durationRaw.slice(0, -1);
      const durationInt = parseInt(durationAI, 10);
      duration.setMinutes(duration.getMinutes() + durationInt);
    } else if (durationRaw.endsWith('h')) {
      const durationAI = durationRaw.slice(0, -1);
      const durationInt = parseInt(durationAI, 10);
      duration.setHours(duration.getHours() + durationInt);
    } else {
      return message.reply('Чтобы назначить длину мута используйте следующие значения:\n1m/1h/1d');
    }

    const mDur = new Date(duration).getTime();

    const mute = {
      author: message.author.id,
      timeStamp: new Date().getTime(),
      duration: mDur,
      reason,
    }

    const previousMutes = await muteScript.findOne({
      guildID,
      userID
    });

    if (previousMutes === null) {
      const mutedRole = message.guild.roles.cache.find((role) => {
        return role.name === 'Muted';
      });

      if (!mutedRole) {
        return message.reply('Роль `Muted` не была найдена на этом сервере.');
      }

      const targetMember = message.guild.members.cache.get(target.id);
      targetMember?.roles.add(mutedRole);

      await muteScript.findOneAndUpdate({
        guildID,
        userID,
      }, {
        guildID,
        userID,
        current: true,
        $push: {
          mutes: mute
        }
      }, {
        upsert: true,
        useFindAndModify: false
      });

      message.reply(`${target.tag} был замучен.\nПричина: ${reason}\nЕго/её размутит: ${moment(duration).utc().format('DD.MM.YYYY | HH:mm:ss')}`);
      target.send(`Вы были замучены на сервере **${message.guild}** модератором ${message.author} до ${moment(duration).utc().format('DD.MM.YYYY | HH:mm:ss')}!\n\nПричина: ${reason}`);
    } else {
      let current = false;

      const currentMute = previousMutes.current;
      if (currentMute) {
        current = true
      }
      if (current) {
        return message.reply("Этот пользователь уже замучен.");
      } else {
        const mutedRole = message.guild.roles.cache.find((role) => {
          return role.name === 'Muted';
        });

        if (!mutedRole) {
          return message.reply('Роль `Muted` не была найдена на этом сервере.');
        }

        const targetMember = message.guild.members.cache.get(target.id);
        targetMember?.roles.add(mutedRole);

        await muteScript.findOneAndUpdate({
          guildID,
          userID
        }, {
          guildID,
          userID,
          current: true,
          $push: {
            mutes: mute
          }
        }, {
          upsert: true,
          useFindAndModify: false
        });

        message.reply(`${target.tag} был замучен.\nПричина: ${reason}\nЕго/её размутит: ${moment(duration).utc().format('DD.MM.YYYY | HH:mm:ss')}`);
        return target.send(`Вы были замучены на сервере **${message.guild}** модератором ${message.author} до ${moment(duration).utc().format('DD.MM.YYYY | HH:mm:ss')}!\n\nПричина: ${reason}`);
      }
    }
  }
}