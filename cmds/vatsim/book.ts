import axios from "axios";
import authScript from '../../schema/authSchema';
import langScript from '../../schema/langSchema';
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
    const currLang = await langScript.findOne({ ver: 0 });
    const userCheck = await authScript.findOne({
      discordID: message.author.id,
      guildID: message.guild.id
    });


    if (
      !userCheck || 
      (!message.member?.roles.cache.some(role => role.name === 'Guest ATC') && 
      !message.member?.roles.cache.some(role => role.name === 'ATC') && 
      !message.member?.roles.cache.some(role => role.name === 'Student') && 
      !message.member?.roles.cache.some(role => role.name === 'ATC Trainee') && 
      !message.member?.roles.cache.some(role => role.name === 'Mentor') &&
      !message.member?.roles.cache.some(role => role.name === 'Начальник РПИ') &&
      !message.member?.roles.cache.some(role => role.name === 'Администраторы'))) {
      return message.reply(currLang.lang === 0 ? 'Вы не имеете доступа к данной команде!' : 'You do not have access to this command!');
    }

    const filter = (m: CommandoMessage) => m.author.id === message.author.id;
    //@ts-ignore
    const collector = new MessageCollector(message.channel, filter, {
      max: 1,
      time: 1000 * 300
    });

    const apiInstance = axios.create({
      headers: localAPIheaders,
      baseURL: 'https://api.veuroexpress.org:5000'
    });

    switch (args.action) {
      case "add":
        message.reply(currLang.lang === 0 ? 'Пожалуйста предоставьте информацию о брони в формате:\n`1433887 - UBBB_APP - 31.01.2020 12:00:00 - 31.01.2020 13:00:00`\nИЛИ\n`1381778 - UBBB_APP - 03.04.2021 15:00 - 18:00`\n`VATSIM CID - Позиция - Время начала смены - Время конца смены`' : 'Please provide your booking information in one of the following formats:\n`1433887 - UBBB_APP - 31.01.2020 12:00:00 - 31.01.2020 13:00:00`\nOR\n`1381778 - UBBB_APP - 03.04.2021 15:00 - 18:00`\n`VATSIM CID - Position - Shift start time - Shift end time`');
        collector.on('end', async (collected) => {
          if (collected == null) return;
          const collectedArr = collected.array();
          const bookingData = collectedArr[0].content.split('-');
          
          //parameters
          let cid = bookingData[0].trim();
          let pos = bookingData[1].trim();
          let from = bookingData[2].trim();
          let till = bookingData[3].trim();

          if (till.length ===  5) {
            till = from.split(' ')[0] + ' ' + bookingData[3].trim();
          }

          if (cid !== userCheck.cid) {
            return message.reply(currLang.lang === 0 ? 'Чтобы избежать проблем и претензий, вы не можете забронировать за другого члена сети ВАТСИМ.' : 'To avoid any negative consequences, you cannot book for any other VATSIM member, other than yourself.');
          }

          let res = await apiInstance.post('/v1/bookings', {
            cid,
            pos,
            from,
            till
          });

          if (res.data.success) {
            return message.reply(currLang.lang === 0 ? 'Бронь успешно добавлена!' : 'Booking successfully created!');
          }
        });
        break;
      case "remove":
        message.reply(currLang.lang === 0 ? 'Пожалуйста предоставьте ID брони.' : 'Please provide booking\'s ID.');
        collector.on('end', async (collected) => {
          if (collected == null) return;
          const collectedArr = collected.array();
          const bookingID = parseInt(collectedArr[0].content);

          let res = await apiInstance.delete('/v1/bookings', {
            data: { ver: bookingID }
          });

          if (res.data.success) {
            return message.reply(currLang.lang === 0 ? 'Операция успешно выполнена!' : 'Operation successfully completed.');
          }

          return message.reply(currLang.lang === 0 ? 'Ошибка удаления брони!' : 'An error occurred while deleting your booking.');
        });
        break;
      case "edit":
        message.reply(currLang.lang === 0 ? 'Чтобы изменить информацию о брони, пожалуйста предоставьте информацию о брони в формате:\n`0 - URRV_CTR - 31.01.2020 12:00:00 - 31.01.2020 13:00:00`\n`ID Брони - Позиция - Время начала смены - Время конца смены`' : 'To edit the information about your booking, please provide the booking information in the following format:\n`0 - URRV_CTR - 31.01.2020 12:00:00 - 31.01.2020 13:00:00`\n`Booking ID - Position - Shift start time - Shift end time`');
        collector.on('end', async (collected) => {
          if (collected == null) return;
          const collectedArr = collected.array();
          const bookingData = collectedArr[0].content.split('-');

          let allbooks = await apiInstance.get('/v1/bookings');

          if (allbooks.data.bookings.find((booking: any) => booking.ver === parseInt(bookingData[0].trim())).cid !== userCheck.cid) {
            return message.reply(currLang.lang === 0 ? 'Вы не можете измеить букинг другого человека.' : 'You cannot edit someone else\'s booking.');
          }
          
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
            return message.reply(currLang.lang === 0 ? 'Бронь успешно изменена!' : 'Booking successfully edited.');
          }

          return message.reply(currLang.lang === 0 ? 'Ошибка изменения брони!' : 'An error occurred while editing your booking.');
        });
        break;
      case '':
        return message.reply(currLang.lang === 0 ? 'Предоставьте тип действия.' : 'Please provide the type of action you\'d like to perform.');
      default:
        collector.emit('end');
        const bookingData = args.action.split('-');
          
        //parameters
        let cid = bookingData[0].trim();
        let pos = bookingData[1].trim();
        let from = bookingData[2].trim();
        let till = bookingData[3].trim();
  
        if (till.length ===  5) {
          till = from.split(' ')[0] + ' ' + bookingData[3].trim();
        }
  
        if (cid !== userCheck.cid) {
          return message.reply(currLang.lang === 0 ? 'Чтобы избежать проблем и претензий, вы не можете забронировать за другого члена сети ВАТСИМ.' : 'To avoid any negative consequences, you cannot book for any other VATSIM member, other than yourself.');
        }
  
        let res = await apiInstance.post('/v1/bookings', {
          cid,
          pos,
          from,
          till
        });
  
        if (res.data.success) {
          return message.reply(currLang.lang === 0 ? 'Бронь успешно добавлена!' : 'Booking successfully created!');
        }
    }

    return null;
  }
}