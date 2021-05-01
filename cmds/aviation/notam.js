"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_commando_1 = __importDefault(require("discord.js-commando"));
const axios_1 = __importDefault(require("axios"));
const langSchema_1 = __importDefault(require("../../schema/langSchema"));
const config_json_1 = require("../../config.json");
const discord_js_1 = require("discord.js");
class NOTAMcommand extends discord_js_commando_1.default.Command {
    constructor(client) {
        super(client, {
            name: 'notam',
            group: 'aviation',
            memberName: 'notam',
            description: 'Выдаёт НОТАМы по аэропорту. | A command to get NOTAM of a certain airport.',
            args: [
                {
                    key: 'airport',
                    prompt: "НОТАМы какого аэропорта вы хотели бы получить? | What airport's metar would you like to get?",
                    type: 'string',
                    validate: (text) => text.length === 4
                }
            ],
            argsCount: 1,
            examples: ['!notam EVRA']
        });
    }
    async run(message, args) {
        const currLang = await langSchema_1.default.findOne({ ver: 0 });
        let getNOTAM = async () => {
            let airportString = args.airport;
            let airportCode = airportString.toUpperCase();
            let NOTAMURL = `https://applications.icao.int/dataservices/api/notams-realtime-list?api_key=${config_json_1.notamkey}&format=&criticality=&locations=${airportCode}`;
            let notams = await axios_1.default.get(NOTAMURL);
            return notams;
        };
        let notamValue = await getNOTAM().catch(() => null);
        //@ts-ignore
        for (const notam of notamValue.data) {
            const notamember = new discord_js_1.MessageEmbed()
                .setColor(config_json_1.mainColor)
                .setAuthor(`NOTAM for ${args.airport.toUpperCase()}`, this.client.user?.displayAvatarURL(), 'http://veuroexpress.org')
                .setDescription(notam.all)
                .setFooter(config_json_1.mainFooter, this.client.user?.displayAvatarURL());
            message.author.send(notamember);
        }
        //@ts-ignore
        if (notamValue.data.length < 1) {
            return message.reply(currLang.lang === 0 ? 'Данные не найдены.' : 'No data found.');
        }
        //@ts-ignore
        if (notamValue.data[0].all) {
            return message.reply(currLang.lang === 0 ? 'отсылаю вам информацию в ЛС.' : 'sent you a DM with information.');
        }
        return null;
    }
}
exports.default = NOTAMcommand;
