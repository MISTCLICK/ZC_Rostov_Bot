import axios from "axios";
import authScript from '../../schema/authSchema';
import { localAPIheaders } from '../../config.json';
import { MessageCollector } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class BookCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "book",
      group: "vatsim",
      memberName: "book",
      description: "Создаёт, удаляет или редакитирует бронь АТС позиции.",
      args: [
        {
          key: "action",
          type: "string",
          prompt: "Какое действие вы хотите совершить? `add` - новая бронь, `remove` - удалить бронь, `edit` - именить бронь.",
          default: ''
        }
      ],
      guildOnly: true
    });
  }

  async run(message: CommandoMessage, args: any) {
    const userCheck = await authScript.findOne({
      discordID: message.author.id,
      guildID: message.guild.id
    });

    if (!userCheck) {
      return message.reply('Вы не имеете доступа к данной команде!');
    }

    const filter = (m: CommandoMessage) => m.author.id === message.author.id;
    //@ts-ignore
    const collector = new MessageCollector(message.channel, filter, {
      max: 1,
      time: 1000 * 300
    });

    const apiInstance = axios.create({
      headers: localAPIheaders,
      baseURL: 'http://localhost:5000'
    });

    switch (args.action) {
      case "add":
        message.reply('Пожалуйста предоставьте информацию о брони в формате:\n`1433887 - UBBB_APP - 31.01.2020 12:00:00 - 31.01.2020 13:00:00`\n`VATSIM CID - Позиция - Время начала смены - Время конца смены`');
        collector.on('end', async (collected) => {
          if (collected == null) return;
          const collectedArr = collected.array();
          const bookingData = collectedArr[0].content.split('-');
          
          //parameters
          const cid = bookingData[0].trim();
          const pos = bookingData[1].trim();
          const from = bookingData[2].trim();
          const till = bookingData[3].trim();

          if (cid !== userCheck.cid) {
            return message.reply('Чтобы избежать проблем и претензий, вы не можете забронировать за другого члена сети ВАТСИМ.');
          }

          let res = await apiInstance.post('/v1/bookings', {
            cid,
            pos,
            from,
            till
          });

          if (res.data.success) {
            return message.reply('Бронь успешно добавлена!');
          }
        });
        break;
      case "remove":
        message.reply('Пожалуйста предоставьте ID брони.');
        collector.on('end', async (collected) => {
          if (collected == null) return;
          const collectedArr = collected.array();
          const bookingID = parseInt(collectedArr[0].content);

          let res = await apiInstance.delete('/v1/bookings', {
            data: { ver: bookingID }
          });

          if (res.data.success) {
            return message.reply('Операция успешно выполнена!');
          }

          return message.reply('Ошибка удаления брони!');
        });
        break;
      case "edit":
        message.reply('Чтобы изменить информацию о брони, пожалуйста предоставьте информацию о брони в формате:\n`0 - URRV_CTR - 31.01.2020 12:00:00 - 31.01.2020 13:00:00`\n`ID Брони - Позиция - Время начала смены - Время конца смены`');
        collector.on('end', async (collected) => {
          if (collected == null) return;
          const collectedArr = collected.array();
          const bookingData = collectedArr[0].content.split('-');
          
          //parameters
          const ver = parseInt(bookingData[0].trim());
          const pos = bookingData[1].trim();
          const from = bookingData[2].trim();
          const till = bookingData[3].trim();

          let res = await apiInstance.patch('/v1/bookings', {
            ver,
            cid: userCheck.cid,
            pos,
            from,
            till
          });

          if (res.data.success) {
            return message.reply('Бронь успешно изменена!');
          }

          return message.reply('Ошибка изменения брони!');
        });
        break;
      default:
        collector.emit('end');
        message.reply('Пожалуйста предоставьте метод выполнения команды. `add` - новая бронь, `remove` - удалить бронь, `edit` - именить бронь.');
    }

    return null;
  }
}