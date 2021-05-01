import { CommandoClient } from "discord.js-commando";
import { ukraineAPIkey, mainColor, mainFooter } from '../config.json';
import axios from "axios";
import atcNotifyScript from '../schema/atcNotifySchema';
import rostovOnlineATCscript from '../schema/rostovOnlineATCschema';
import moment from "moment";
import { MessageEmbed } from "discord.js";

export default async function autoNotifyATC(client: CommandoClient) {
  setInterval(async () => {
    let APIinstance = axios.create({
      headers: {
        "X-API-Key": ukraineAPIkey,
        "filter": "^UR.+_.+$|^UG.+_.+$|^UB.+_.+$|^UD.+_.+$|^UKF.+_.+$|^SIP_.+$|^RU-SC.+FSS$|^ROV.+$"
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
      for (const station in onlineStations.data.result) {
        if (!station.endsWith('ATIS') && !station.endsWith('OBS')) currentATClist.push(station);
      }
      for (const station in prevStations.result) {
        if (!station.endsWith('ATIS') && !station.endsWith('OBS')) oldATClist.push(station);
      }

      //Check if new ATC logged on
      for (let i = 0; i < currentATClist.length; i++) {
        if (!oldATClist.find(station => station === currentATClist[i])) {
          for (const guildSetting of guildData) {
            const channel = client.channels.cache.get(guildSetting.channelID);

            const atcOnlineEmbed = new MessageEmbed()
              .setColor('#00ff04')
              .setFooter(mainFooter)
              .setAuthor(`${currentATClist[i]} онлайн!`, client.user?.displayAvatarURL())
              .setDescription(`**${onlineStations.data.result[currentATClist[i]].name}** открыл позицию УВД **${currentATClist[i]}**\n${moment(new Date()).utc().format('HH:mm')}z\nЧастота **${onlineStations.data.result[currentATClist[i]].frequency}**`)

            //@ts-ignore
            channel?.send(atcOnlineEmbed);
          }
        }
      }

      //Check if ATC logged off
      for (let j = 0; j < oldATClist.length; j++) {
        if (!currentATClist.find(station => station === oldATClist[j])) {
          for (const guildSetting of guildData) {
            const channel = client.channels.cache.get(guildSetting.channelID);

            const atcOfflineEmbed = new MessageEmbed()
              .setColor('#ff0000')
              .setFooter(mainFooter)
              .setAuthor(`${oldATClist[j]} офлайн!`, client.user?.displayAvatarURL())
              .setDescription(`Позиция УВД **${oldATClist[j]}** (${prevStations.result[oldATClist[j]].name}) была закрыта\n${moment(new Date()).utc().format('HH:mm')}z`)

            //@ts-ignore
            channel?.send(atcOfflineEmbed);
          }
        }
      }
    }
  }, 1000 * 60);
}