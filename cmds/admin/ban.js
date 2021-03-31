"use strict";
const discord_js_commando_1 = require("discord.js-commando");
module.exports = class BanCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'admin',
            memberName: 'ban',
            description: 'Позволяет забанить пользователя',
            userPermissions: ['BAN_MEMBERS'],
            argsType: 'multiple'
        });
    }
    async run(message, args) {
        const target = message.mentions.users.first();
        if (!target)
            return message.reply('Пользователь не найден.');
        args.shift();
        const reason = args.join(' ');
        if (reason == '')
            return message.reply('Пожалуйста предоставьте причину.');
        const targetMember = message.guild.members.cache.get(target.id);
        if (!targetMember)
            return message.reply('Пользователь не найден');
        await target.send(`Вы были забанены с сервера **${message.guild.name}** модератором **${message.author.username}** по причине: \`${reason}\``);
        targetMember.ban({ reason: reason });
        return message.reply(`${target.username} был успешно забанен.`);
    }
};
