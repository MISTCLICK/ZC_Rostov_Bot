import { CommandoClient } from "discord.js-commando";
import { localAPIheaders } from '../config.json';
import axios, { AxiosResponse } from "axios";
import permaBookScript from '../schema/permaBookSchema';
import authScript from '../schema/authSchema';
import moment from "moment";

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

export default async function updateBooks(client: CommandoClient) {
  setInterval(async () => {
    const data = await permaBookScript.find();
    if (data === null) return;
    for (const guildSetting of data) {
      const checkChannel = (text: string, id: string) => {
        const channel: any = client.channels.cache.get(id);
        channel?.messages.fetch().then((messages: any) => {
          if (messages.size === 0) {
            channel.send(text);
          } else {
            for (const message of messages) {
              message[1].edit(text);
            }
          }
        });
      }

      let res = await axios.create({
        headers: localAPIheaders,
        baseURL: 'https://api.veuroexpress.org:5000'
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

      checkChannel(bookingsText, guildSetting.channelID);
    }
  }, 1000 * 30);
}
