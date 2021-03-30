import axios, { AxiosResponse } from "axios";
import authScript from '../../schema/authSchema';
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

export default class ViewBooks extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "view-bookings",
      group: "vatsim",
      memberName: "view-bookings",
      description: "Показывает список бронирований диспетчерских позиций.",
      aliases: ["bookings", "show-bookings", "books"],
      guildOnly: true
    });
  }

  async run(message: CommandoMessage) {
    let res = await axios.create({
      headers: localAPIheaders,
      baseURL: 'http://localhost:5000'
    }).get('/v1/bookings');

    let bookingsText = '**Список УВД бронирований в ЗЦ Ростов**\n\n';

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

    return message.reply(bookingsText);
  }
}