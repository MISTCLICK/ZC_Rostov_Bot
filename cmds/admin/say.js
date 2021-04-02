"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_commando_1 = require("discord.js-commando");
class SayCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'say',
            group: 'admin',
            memberName: 'say',
            description: 'Позволяет сказать что-то от имени бота.',
            guildOnly: true,
            userPermissions: ["MANAGE_MESSAGES"],
            argsType: 'multiple'
        });
    }
    //@ts-ignore
    async run(message, args) {
        const channel = message.mentions.channels.first();
        if (channel) {
            channel?.send(args.join(' ').replace(`<#${channel.id}>`, '').trim());
        }
        else {
            message.channel.send(args);
        }
    }
}
exports.default = SayCommand;
