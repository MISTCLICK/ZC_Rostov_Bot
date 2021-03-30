"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const authSchema_1 = __importDefault(require("../../schema/authSchema"));
const permaBookSchema_1 = __importDefault(require("../../schema/permaBookSchema"));
const moment_1 = __importDefault(require("moment"));
const config_json_1 = require("../../config.json");
const discord_js_commando_1 = require("discord.js-commando");
class SetPermaBookCommand extends discord_js_commando_1.Command {
    constructor(client) {
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
            ]
        });
    }
    async run(message, { channelTag }) {
        const channelID = channelTag.slice(2, -1);
        const channel = this.client.channels.cache.get(channelID);
        const guildID = message.guild.id;
        let res = await axios_1.default.create({
            headers: config_json_1.localAPIheaders,
            baseURL: 'http://localhost:5000'
        }).get('/v1/bookings');
        let bookingsText = `**Список УВД бронирований в ЗЦ Ростов**\nДанные от ${moment_1.default(new Date()).utc().format('DD.MM.YYYY | HH:mm:ss')} Z\n\n`;
        if (res.data.bookings) {
            bookingsText += 'ID Брони / Имя Диспетчера и CID / Позиция УВД / Начало смены / Конец смены\n```\n';
            for (const book of res.data.bookings) {
                const thisATC = await authSchema_1.default.findOne({
                    cid: book.cid
                });
                let VATmember = await axios_1.default.get(`https://api.vatsim.net/api/ratings/${book.cid}/`);
                bookingsText += thisATC ? `${book.ver} | ${thisATC?.full_vatsim_data.name_first} ${thisATC?.full_vatsim_data.name_last} ${book.cid} | ${book.pos} | ${book.from} | ${book.till}\n` : `${book.ver} | ${VATmember.data.name_first} ${VATmember.data.name_last} ${book.cid} | ${book.pos} | ${book.from} | ${book.till}\n`;
            }
            bookingsText += '```';
        }
        else {
            bookingsText += '```\nНи одной брони не было найдено. Очень жаль!\n```';
        }
        await permaBookSchema_1.default.findOneAndUpdate({
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
exports.default = SetPermaBookCommand;
