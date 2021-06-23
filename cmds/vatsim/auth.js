"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const authSchema_1 = __importDefault(require("../../schema/authSchema"));
const langSchema_1 = __importDefault(require("../../schema/langSchema"));
const config_json_1 = require("../../config.json");
const discord_js_commando_1 = require("discord.js-commando");
class AuthCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: "auth",
            group: "vatsim",
            memberName: 'auth',
            description: 'Позволяет привязать аккаунт в сети VATSIM к этому серверу в Дискорде | Allows to connect your VATSIM account to this Discord server.',
            guildOnly: true
        });
    }
    async run(message) {
        const currLang = await langSchema_1.default.findOne({ ver: 0 });
        try {
            const vatRole = message.guild.roles.cache.find(role => role.name === 'Member');
            if (!vatRole) {
                return message.reply(currLang.lang === 0 ? 'Этот сервер не подготовлен для использования данной команды. Пожалуйста обратитесь к администрации сервера.' : "This server is not suited for the use of this command. Please contact the server's administrators.");
            }
            const userCheck = await authSchema_1.default.findOne({
                discordID: message.author.id,
                guildID: message.guild.id
            });
            if (userCheck) {
                if (userCheck.dataType === 'old') {
                    //@ts-ignore
                    message.member?.setNickname(`${userCheck.full_vatsim_data.name_first} ${userCheck.full_vatsim_data.name_last} - ${userCheck.cid}`).catch(() => null);
                }
                else {
                    //@ts-ignore
                    message.member?.setNickname(`${userCheck.full_vatsim_data.personal.name_first} ${userCheck.full_vatsim_data.personal.name_last} - ${userCheck.cid}`).catch(() => null);
                }
                message.reply(currLang.lang === 0 ? `Этот аккаунт уже привязан к VATSIM CID ${userCheck.cid}. Вы не можете его отвязать или переместить на другую учётную запись самостоятельно, пожалуйста обратитесь к администрации сервера.` : `This account is already connected to VATSIM CID ${userCheck.cid}. You cannot disconnect it or connect it to any other VATSIM CID yourself. Please contact the server\'s administrators.`);
                message.member?.roles.add(vatRole);
                return null;
            }
            let firstStageRes = await axios_1.default.post(config_json_1.oauthCfg.redirect_uri, {
                discordID: message.author.id,
                guildID: message.guild.id,
            });
            if (firstStageRes.data.success) {
                message.reply(currLang.lang === 0 ? 'Высылаю ссылку для привязки аккаунта сети VATSIM вам в ЛС...' : 'Sending an authentication link into your DMs now...');
                return message.author.send(`https://auth.vatsim.net/oauth/authorize?client_id=${config_json_1.oauthCfg.client_id}&redirect_uri=${config_json_1.oauthCfg.redirect_uri}&response_type=code&scope=full_name+vatsim_details+email+country`);
            }
            else {
                return message.reply(firstStageRes.data.message);
            }
        }
        catch (err) {
            return message.reply(currLang.lang === 0 ? 'Произошла ошибка при вашей Аутентификации. Пожалуйста обратитесь к администрации сервера.' : 'There was an error during your authentication. Please contact the server\'s administrators.');
        }
    }
}
exports.default = AuthCommand;
