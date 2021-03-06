"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = require("../config.json");
const axios_1 = __importDefault(require("axios"));
const permaBookSchema_1 = __importDefault(require("../schema/permaBookSchema"));
const authSchema_1 = __importDefault(require("../schema/authSchema"));
const moment_1 = __importDefault(require("moment"));
async function updateBooks(client) {
    setInterval(async () => {
        const data = await permaBookSchema_1.default.find();
        if (data === null)
            return;
        for (const guildSetting of data) {
            const checkChannel = (text, id) => {
                const channel = client.channels.cache.get(id);
                channel?.messages.fetch().then((messages) => {
                    if (messages.size === 0) {
                        channel.send(text);
                    }
                    else {
                        for (const message of messages) {
                            message[1].edit(text);
                        }
                    }
                });
            };
            let res = await axios_1.default.create({
                headers: config_json_1.localAPIheaders,
                baseURL: 'https://api.veuroexpress.org:2087'
            }).get('/v1/bookings');
            let bookingsText = `**Список УВД бронирований в ЗЦ Ростов**\nДанные от ${moment_1.default(new Date()).utc().format('DD.MM.YYYY | HH:mm:ss')} Z\n\n`;
            if (res.data.bookings) {
                bookingsText += 'ID Брони / Имя Диспетчера и CID / Позиция УВД / Начало смены / Конец смены\n```\n';
                for (const book of res.data.bookings.filter((book) => !book.pos.startsWith('UM'))) {
                    const thisATC = await authSchema_1.default.findOne({
                        cid: book.cid
                    });
                    if (thisATC) {
                        if (thisATC?.dataType === 'old') {
                            //@ts-ignore
                            bookingsText += `${book.ver} | ${thisATC?.full_vatsim_data.name_first} ${thisATC?.full_vatsim_data.name_last} ${book.cid} | ${book.pos} | ${book.from} | ${book.till}\n`;
                        }
                        else {
                            //@ts-ignore
                            bookingsText += `${book.ver} | ${thisATC?.full_vatsim_data.personal.name_first} ${thisATC?.full_vatsim_data.personal.name_last} ${book.cid} | ${book.pos} | ${book.from} | ${book.till}\n`;
                        }
                    }
                    else {
                        bookingsText += `${book.ver} | ${book.cid} | ${book.pos} | ${book.from} | ${book.till}\n`;
                    }
                }
                bookingsText += '```';
            }
            else {
                bookingsText += '```\nНи одной брони не было найдено. Очень жаль!\n```';
            }
            checkChannel(bookingsText, guildSetting.channelID);
        }
    }, 1000 * 30);
}
exports.default = updateBooks;
