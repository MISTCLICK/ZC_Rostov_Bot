"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const discord_js_commando_1 = __importDefault(require("discord.js-commando"));
const welcomeScript_1 = __importDefault(require("../../schema/welcomeScript"));
class SetupCommand extends discord_js_commando_1.default.Command {
    constructor(client) {
        super(client, {
            name: 'setup-welcome',
            group: 'admin',
            memberName: 'setup-welcome',
            description: 'Позволяет настроить систему оповещений о входе/выходе с сервера.',
            clientPermissions: ['ADMINISTRATOR'],
            userPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_MESSAGES'],
            guildOnly: true
        });
    }
    async run(message) {
        const questions = [
            'Тэгните канал, где будут объявляться входы на сервер.',
            'Введите текст приветственного сообщения.',
            'Тэгните роль, которая будет выдаваться всем входящим (напишите "N" если не хотите иметь такую роль).',
            'Тэгните канал, где будут объявляться выходы с сервера.',
            'Введите текст прощального сообщения.'
        ];
        let counter = 0;
        const guildID = message.guild.id;
        const filter = (m) => m.author.id === message.author.id;
        //@ts-ignore
        const collector = new discord_js_1.MessageCollector(message.channel, filter, {
            max: questions.length,
            time: 1000 * 120
        });
        message.channel.send(questions[counter++]);
        collector.on('collect', async (m) => {
            if (counter < questions.length) {
                m.channel.send(questions[counter++]);
            }
        });
        collector.on('end', async (collected) => {
            const collectedArr = collected.array();
            if (collectedArr.length < questions.length)
                return message.reply('Недостаточно информации.');
            let welcomeRoleID;
            if (collectedArr[2].content === 'N') {
                //@ts-ignore
                welcomeRoleID = null;
            }
            else {
                welcomeRoleID = collectedArr[2].content.slice(3, -1);
            }
            const settingsObj = {
                welcome: {
                    channelID: collectedArr[0].content.slice(2, -1),
                    text: collectedArr[1].content,
                    role: welcomeRoleID
                },
                leave: {
                    channelID: collectedArr[3].content.slice(2, -1),
                    text: collectedArr[4].content
                }
            };
            await welcomeScript_1.default.findOneAndUpdate({
                guildID
            }, {
                guildID,
                //@ts-ignore
                settingsObj
            }, {
                upsert: true,
                useFindAndModify: false
            }).catch(err => console.error(err));
            return message.reply('Настройка была завершена успешно.');
        });
        return null;
    }
}
exports.default = SetupCommand;
