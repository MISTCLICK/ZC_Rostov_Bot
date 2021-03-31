import { CommandoClient } from "discord.js-commando";
import { ukraineAPIkey } from '../config.json';
import axios from "axios";
import atcNotifyScript from '../schema/atcNotifySchema';
import rostovOnlineATCscript from '../schema/rostovOnlineATCschema';
import moment from "moment";

export default async function autoNotifyATC(client: CommandoClient) {
  setInterval(async () => {
    let APIinstance = axios.create({
      headers: {
        "X-API-Key": ukraineAPIkey,
        "filter": /^UR.+_.+$|^UG.+_.+$|^UB.+_.+$|^UD.+_.+$/
      },
      baseURL: 'https://api.vacc-ua.org'
    });

    let onlineStations = await APIinstance.get('/api/atc');

    const prevStations = await rostovOnlineATCscript.findOne({ permanent: 0 });
    await rostovOnlineATCscript.findOneAndUpdate({
      permanent: 0
    }, {
      info: onlineStations.data.info,
      result: onlineStations.data.result
    }, {
      upsert: true
    });

    const guildData = await atcNotifyScript.find();
    if (guildData === null) return;

    if (prevStations && prevStations.info.found !== onlineStations.data.info.found) {
      let currentATClist: string[] = [];
      let oldATClist: string[] = [];
      for (const station in onlineStations.data.result) currentATClist.push(station);
      for (const station in prevStations.result) oldATClist.push(station);

      //Check if new ATC logged on
      for (let i = 0; i < currentATClist.length; i++) {
        if (!oldATClist.find(station => station === currentATClist[i])) {
          for (const guildSetting of guildData) {
            const channel = client.channels.cache.get(guildSetting.channelID);
            //@ts-ignore
            channel?.send(`**${onlineStations.data.result[currentATClist[i]].realname}** открыл позицию УВД **${currentATClist[i]}** в ${moment(new Date()).utc().format('HH:mm')}z на частоте **${onlineStations.data.result[currentATClist[i]].frequency}**`);
          }
        }
      }

      //Check if ATC logged off
      for (let j = 0; j < oldATClist.length; j++) {
        if (!currentATClist.find(station => station === oldATClist[j])) {
          for (const guildSetting of guildData) {
            const channel = client.channels.cache.get(guildSetting.channelID);
            //@ts-ignore
            channel?.send(`Позиция УВД **${oldATClist[j]}** (${prevStations.result[oldATClist[j]].realname}) была закрыта в ${moment(new Date()).utc().format('HH:mm')}z`);
          }
        }
      }
    }
  }, 1000 * 60);
}
