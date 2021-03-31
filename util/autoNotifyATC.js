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
async function autoNotifyATC(client) {
    setInterval(async () => {
        let APIinstance = axios_1.default.create({
            headers: {
                "X-API-Key": config_json_1.ukraineAPIkey,
                "filter": /^UR.+_.+$|^UG.+_.+$|^UB.+_.+$|^UD.+_.+$/
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
            for (const station in onlineStations.data.result)
                currentATClist.push(station);
            for (const station in prevStations.result)
                oldATClist.push(station);
            //Check if new ATC logged on
            for (let i = 0; i < currentATClist.length; i++) {
                if (!oldATClist.find(station => station === currentATClist[i])) {
                    for (const guildSetting of guildData) {
                        const channel = client.channels.cache.get(guildSetting.channelID);
                        //@ts-ignore
                        channel?.send(`**${onlineStations.data.result[currentATClist[i]].realname}** открыл позицию УВД **${currentATClist[i]}** в ${moment_1.default(new Date()).utc().format('HH:mm')}z на частоте **${onlineStations.data.result[currentATClist[i]].frequency}**`);
                    }
                }
            }
            //Check if ATC logged off
            for (let j = 0; j < oldATClist.length; j++) {
                if (!currentATClist.find(station => station === oldATClist[j])) {
                    for (const guildSetting of guildData) {
                        const channel = client.channels.cache.get(guildSetting.channelID);
                        //@ts-ignore
                        channel?.send(`Позиция УВД **${oldATClist[j]}** (${prevStations.result[oldATClist[j]].realname}) была закрыта в ${moment_1.default(new Date()).utc().format('HH:mm')}z`);
                    }
                }
            }
        }
    }, 1000 * 60);
}
exports.default = autoNotifyATC;
