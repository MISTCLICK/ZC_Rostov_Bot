"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = require("../config.json");
const axios_1 = __importDefault(require("axios"));
const atcNotifySchema_1 = __importDefault(require("../schema/atcNotifySchema"));
const rostovOnlineATCschema_1 = __importDefault(require("../schema/rostovOnlineATCschema"));
const moment_1 = __importDefault(require("moment"));
const discord_js_1 = require("discord.js");
async function autoNotifyATC(client) {
    setInterval(async () => {
        let APIinstance = axios_1.default.create({
            headers: {
                "X-API-Key": config_json_1.ukraineAPIkey,
                "filter": "^UR.+_.+$|^UG.+_.+$|^UB.+_.+$|^UD.+_.+$|^UKF.+_.+$|^SIP_.+$|^RU-SC.+FSS$"
            },
            baseURL: 'https://api.vacc-ua.org'
        });
        let onlineStations = await APIinstance.get('/api/atc');
        const prevStations = await rostovOnlineATCschema_1.default.findOne({ permanent: 0 });
        await rostovOnlineATCschema_1.default.findOneAndUpdate({
            permanent: 0
        }, {
            info: onlineStations.data.info,
            result: onlineStations.data.result
        }, {
            upsert: true
        });
        const guildData = await atcNotifySchema_1.default.find();
        if (guildData === null)
            return;
        if (prevStations && prevStations.info.found !== onlineStations.data.info.found) {
            let currentATClist = [];
            let oldATClist = [];
            for (const station in onlineStations.data.result) {
                if (!station.endsWith('ATIS'))
                    currentATClist.push(station);
            }
            for (const station in prevStations.result) {
                if (!station.endsWith('ATIS'))
                    oldATClist.push(station);
            }
            //Check if new ATC logged on
            for (let i = 0; i < currentATClist.length; i++) {
                if (!oldATClist.find(station => station === currentATClist[i])) {
                    for (const guildSetting of guildData) {
                        const channel = client.channels.cache.get(guildSetting.channelID);
                        const atcOnlineEmbed = new discord_js_1.MessageEmbed()
                            .setColor('#00ff04')
                            .setFooter(config_json_1.mainFooter)
                            .setAuthor(`${currentATClist[i]} онлайн!`, client.user?.displayAvatarURL())
                            .setDescription(`**${onlineStations.data.result[currentATClist[i]].name}** открыл позицию УВД **${currentATClist[i]}**\n${moment_1.default(new Date()).utc().format('HH:mm')}z\nЧастота **${onlineStations.data.result[currentATClist[i]].frequency}**`);
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
                        const atcOfflineEmbed = new discord_js_1.MessageEmbed()
                            .setColor('#ff0000')
                            .setFooter(config_json_1.mainFooter)
                            .setAuthor(`${oldATClist[j]} офлайн!`, client.user?.displayAvatarURL())
                            .setDescription(`Позиция УВД **${oldATClist[j]}** (${prevStations.result[oldATClist[j]].name}) была закрыта\n${moment_1.default(new Date()).utc().format('HH:mm')}z`);
                        //@ts-ignore
                        channel?.send(atcOfflineEmbed);
                    }
                }
            }
        }
    }, 1000 * 60);
}
exports.default = autoNotifyATC;
