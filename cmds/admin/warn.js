"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const discord_js_commando_1 = require("discord.js-commando");
const warnScript_1 = __importDefault(require("../../schema/warnScript"));
module.exports = class WarnCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            group: 'admin',
            memberName: 'warn',
            description: 'Позволяет вынести предупреждение пользователю.',
            clientPermissions: ["ADMINISTRATOR"],
            userPermissions: ["MANAGE_MESSAGES"],
            argsType: "multiple",
            guildOnly: true
        });
    }
    //@ts-ignore
    async run(message, args) {
        const targetMember = message.mentions.users.first();
        if (!targetMember)
            return;
        args.shift();
        const reason = args.join(' ');
        const guildID = message.guild.id;
        const userID = targetMember.id;
        if (reason == '')
            return message.reply('Пожалуйста предоставьте причину предупреждения.');
        const warn = {
            author: message.author.id,
            timeStamp: new Date().getTime(),
            reason
        };
        await warnScript_1.default.findOneAndUpdate({
            guildID,
            userID
        }, {
            guildID,
            userID,
            $push: {
                warns: warn
            }
        }, {
            upsert: true
        });
        targetMember.send(`Привет! Модератор **${message.author.username}** вынес тебе предупреждение на сервере **${message.guild.name}** по причине: \`${reason}\``);
        message.reply(`Предупреждение ${targetMember} успешно вынесено! Причина: ${reason}`);
    }
};
