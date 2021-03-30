"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const authSchema_1 = __importDefault(require("../../schema/authSchema"));
const config_json_1 = require("../../config.json");
const discord_js_commando_1 = require("discord.js-commando");
class ViewBooks extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: "view-bookings",
            group: "vatsim",
            memberName: "view-bookings",
            description: "Показывает список бронирований диспетчерских позиций.",
            aliases: ["bookings", "show-bookings", "books"],
            guildOnly: true
        });
    }
    async run(message) {
        let res = await axios_1.default.create({
            headers: config_json_1.localAPIheaders,
            baseURL: 'http://localhost:5000'
        }).get('/v1/bookings');
        let bookingsText = '**Список УВД бронирований в ЗЦ Ростов**\n\n';
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
        return message.reply(bookingsText);
    }
}
exports.default = ViewBooks;
