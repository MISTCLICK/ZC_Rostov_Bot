import axios, { AxiosResponse } from "axios";
import authScript from '../../schema/authSchema';
import permaBookScript from '../../schema/permaBookSchema';
import moment from 'moment';
import { localAPIheaders } from '../../config.json';
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

interface vatsimData {
  id: string;
  rating: number;
  pilotrating: number;
  name_first: string;
  name_last: string;
  age: number;
  countystate: string;
  country: string;
  susp_date?: any;
  reg_date: Date;
  region: string;
  division: string;
  subdivision: string;
}

interface thisArgs {
  channelTag: string;
}

export default class SetPermaBookCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "perma-book",
      group: "vatsim",
      memberName: "perma-book",
      description: "Определяет канал для перманентного отображения УВД бронирований.",
      guildOnly: true,
      args: [
        {
          key: "channelTag",
          prompt: "Пожалуйста тэгните канал для перманентного отображения УВД бронирований.",
          type: "string"
        }
      ],
      userPermissions: ["ADMINISTRATOR"]
    });
  }

  async run(message: CommandoMessage, { channelTag }: thisArgs) {
    const channelID = channelTag.slice(2, -1);
    const channel: any = this.client.channels.cache.get(channelID);
    const guildID = message.guild.id;

    let res = await axios.create({
      headers: localAPIheaders,
      baseURL: 'http://localhost:5000'
    }).get('/v1/bookings');

    let bookingsText = `**Список УВД бронирований в ЗЦ Ростов**\nДанные от ${moment(new Date()).utc().format('DD.MM.YYYY | HH:mm:ss')} Z\n\n`;

    if (res.data.bookings) {
      bookingsText += 'ID Брони / Имя Диспетчера и CID / Позиция УВД / Начало смены / Конец смены\n```\n';
      for (const book of res.data.bookings) {
        const thisATC = await authScript.findOne({
          cid: book.cid
        });
        let VATmember = await axios.get<any, AxiosResponse<vatsimData>>(`https://api.vatsim.net/api/ratings/${book.cid}/`);
        bookingsText += thisATC ? `${book.ver} | ${thisATC?.full_vatsim_data.name_first} ${thisATC?.full_vatsim_data.name_last} ${book.cid} | ${book.pos} | ${book.from} | ${book.till}\n` : `${book.ver} | ${VATmember.data.name_first} ${VATmember.data.name_last} ${book.cid} | ${book.pos} | ${book.from} | ${book.till}\n`;
      }
      bookingsText += '```';
    } else {
      bookingsText += '```\nНи одной брони не было найдено. Очень жаль!\n```';
    }

    await permaBookScript.findOneAndUpdate({
      guildID
    }, {
      guildID,
      channelID
    }, {
      upsert: true,
      useFindAndModify: false
    });

    channel?.send(bookingsText);
    return message.reply('Операция успешно завершена!');
  }
}