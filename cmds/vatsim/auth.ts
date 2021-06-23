import axios from "axios";
import authScript from "../../schema/authSchema";
import langScript from '../../schema/langSchema';
import { oauthCfg } from '../../config.json';
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export interface vatsimData {
  id: string;
  rating: number;
  pilotrating: number;
  name_first: string;
  name_last: string;
  age: number;
  countystate: string;
  country: string;
  susp_date?: any;
  reg_date: Date;
  region: string;
  division: string;
  subdivision: string;
}

export interface Personal {
  name_first: string;
  name_last: string;
  name_full: string;
  email: string;
}

export interface Rating {
  id: number;
  long: string;
  short: string;
}

export interface Pilotrating {
  id: number;
  long: string;
  short: string;
}

export interface Division {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface Subdivision {
  id: string;
  name: string;
}

export interface Vatsim {
  rating: Rating;
  pilotrating: Pilotrating;
  division: Division;
  region: Region;
  subdivision: Subdivision;
}

export interface NewVatsimData {
  cid: string;
  personal: Personal;
  vatsim: Vatsim;
}

export default class AuthCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "auth",
      group: "vatsim",
      memberName: 'auth',
      description: 'Позволяет привязать аккаунт в сети VATSIM к этому серверу в Дискорде | Allows to connect your VATSIM account to this Discord server.',
      guildOnly: true
    });
  }

  async run(message: CommandoMessage) {
    const currLang = await langScript.findOne({ ver: 0 });
    try {
      const vatRole = message.guild.roles.cache.find(role => role.name === 'Member');
      if (!vatRole) {
        return message.reply(currLang.lang === 0 ? 'Этот сервер не подготовлен для использования данной команды. Пожалуйста обратитесь к администрации сервера.' : "This server is not suited for the use of this command. Please contact the server's administrators.");
      }

      const userCheck = await authScript.findOne({
        discordID: message.author.id,
        guildID: message.guild.id
      });

      if (userCheck) {
        if (userCheck.dataType === 'old') {
          //@ts-ignore
          message.member?.setNickname(`${userCheck.full_vatsim_data.name_first} ${userCheck.full_vatsim_data.name_last} - ${userCheck.cid}`).catch(() => null);
        } else {
          //@ts-ignore
          message.member?.setNickname(`${userCheck.full_vatsim_data.personal.name_first} ${userCheck.full_vatsim_data.personal.name_last} - ${userCheck.cid}`).catch(() => null);
        }
        message.reply(currLang.lang === 0 ? `Этот аккаунт уже привязан к VATSIM CID ${userCheck.cid}. Вы не можете его отвязать или переместить на другую учётную запись самостоятельно, пожалуйста обратитесь к администрации сервера.` : `This account is already connected to VATSIM CID ${userCheck.cid}. You cannot disconnect it or connect it to any other VATSIM CID yourself. Please contact the server\'s administrators.`);
        message.member?.roles.add(vatRole);
        return null;
      }

      let firstStageRes = await axios.post(oauthCfg.redirect_uri, {
        discordID: message.author.id,
        guildID: message.guild.id,
      });

      if (firstStageRes.data.success) {
        message.reply(currLang.lang === 0 ? 'Высылаю ссылку для привязки аккаунта сети VATSIM вам в ЛС...' : 'Sending an authentication link into your DMs now...');
        return message.author.send(`https://auth.vatsim.net/oauth/authorize?client_id=${oauthCfg.client_id}&redirect_uri=${oauthCfg.redirect_uri}&response_type=code&scope=full_name+vatsim_details+email+country`);
      } else {
        return message.reply(firstStageRes.data.message);
      }
    } catch (err) {
      return message.reply(currLang.lang === 0 ? 'Произошла ошибка при вашей Аутентификации. Пожалуйста обратитесь к администрации сервера.' : 'There was an error during your authentication. Please contact the server\'s administrators.');
    }
  }
}