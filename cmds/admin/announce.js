"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const discord_js_commando_1 = require("discord.js-commando");
const config_json_1 = require("../../config.json");
class AnnounceCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'announce',
            group: 'admin',
            memberName: 'announce',
            description: 'Позволяет объявить что-либо на сервере в Дискорде',
            guildOnly: true,
            aliases: ['ann'],
            userPermissions: ["MANAGE_CHANNELS"]
        });
    }
    async run(message) {
        const questions = [
            'Введите название этого анонса. В любой момент напишите `-` и процесс создания анонса остановится.',
            'Введите ссылку для названия.',
            'Введите основной текст этого анонса.',
            'Введите ссылку на картинку для данного анонса. Если на хотите иметь картинку в этом объявлении, введите `N`.'
        ];
        let counter = 0;
        const filter = (m) => m.author.id === message.author.id;
        //@ts-ignore
        const collector = new discord_js_1.MessageCollector(message.channel, filter, {
            max: questions.length,
            time: 1000 * 600
        });
        message.channel.send(questions[counter++]);
        collector.on('collect', async (m) => {
            if (m.content === '-') {
                collector.emit('end');
                return message.reply('Процесс создания анонса отменён.');
            }
            else if (counter < questions.length) {
                m.channel.send(questions[counter++]);
            }
        });
        collector.on('end', async (collected) => {
            if (collected == null)
                return;
            const collectedArr = collected.array();
            if (collectedArr[0].content == '-' || collectedArr[1].content == '-' || collectedArr[2].content == '-' || collectedArr[3].content == '-') {
                return;
            }
            else if (collectedArr.length < questions.length) {
                return message.reply('Не достаточно информации предоставлено.');
            }
            const title = collectedArr[0].content;
            const titleURL = collectedArr[1].content;
            const description = collectedArr[2].content;
            let imageURL = 'http://veuroexpress.org';
            if (collectedArr[3].content !== 'N' && collectedArr[3].content !== 'n')
                imageURL = collectedArr[3].content;
            const embed = new discord_js_1.MessageEmbed()
                .setColor(config_json_1.mainColor)
                .setAuthor(title, this.client.user?.displayAvatarURL(), titleURL)
                .setDescription(description)
                .setImage(imageURL)
                .setFooter(config_json_1.mainFooter);
            await message.channel.send(embed);
            message.channel.send('Это превью вашего анонса. Напишите `+` чтобы начать процесс публикации или `-` чтобы отменить его. **Если вы начнёте процесс публикации, его нельзя будет отменить!**');
            message.channel.awaitMessages(filter, { max: 1, time: 1000 * 30, errors: ['time'] })
                .then(async (messages) => {
                if (messages.first()?.content == '+') {
                    const questions2 = [
                        'Введите текст оповещения.',
                        'Тэгните канал, куда будет опубликован анонс.',
                    ];
                    counter = 0;
                    //@ts-ignore
                    const collector2 = new discord_js_1.MessageCollector(message.channel, filter, {
                        max: questions2.length,
                        time: 1000 * 120
                    });
                    message.channel.send(questions2[counter++]);
                    collector2.on('collect', async (m) => {
                        if (counter < questions2.length) {
                            m.channel.send(questions2[counter++]);
                        }
                    });
                    collector2.on('end', async (collected2) => {
                        const collected2Arr = collected2.array();
                        if (collected2Arr.length < questions2.length) {
                            return message.reply('Не достаточно информации предоставлено.');
                        }
                        const unEmbed = collected2Arr[0].content;
                        const channelID = collected2Arr[1].content.slice(2, -1);
                        const channel = this.client.channels.cache.get(channelID);
                        const finalEmbed = new discord_js_1.MessageEmbed()
                            .setColor(config_json_1.mainColor)
                            .setAuthor(title, this.client.user?.displayAvatarURL(), titleURL)
                            .setDescription(description)
                            .setImage(imageURL)
                            .setFooter(config_json_1.mainFooter);
                        channel.send(unEmbed, finalEmbed).catch(console.error);
                        message.reply('Анонс успешно опубликован!');
                    });
                }
                else if (messages.first()?.content == '-') {
                    return message.reply('Процесс публикации отменён.');
                }
                else {
                    return message.reply('Тип ответа не определён. Процесс остановлен.');
                }
            }).catch(() => {
                return message.reply('На достаточно информации предоставлено.');
            });
        });
        return null;
    }
}
exports.default = AnnounceCommand;
