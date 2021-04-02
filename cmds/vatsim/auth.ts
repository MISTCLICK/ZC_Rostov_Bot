import axios, { AxiosResponse } from "axios";
import authScript from "../../schema/authSchema";
import langScript from '../../schema/langSchema';
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

interface thisArgs {
  cid: string;
}

interface vatsimData {
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

export default class AuthCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "auth",
      group: "vatsim",
      memberName: 'auth',
      description: 'Позволяет привязать аккаунт в сети VATSIM к этому серверу в Дискорде | Allows to connect your VATSIM account to this Discord server.',
      args: [
        { 
          key: "cid",
          prompt: "Предоставьте существующий VATSIM CID | Please provide an existing VATSIM CID",
          type: "string"
        }
      ],
      guildOnly: true
    });
  }

  async run(message: CommandoMessage, { cid }: thisArgs) {
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
        message.reply(currLang.lang === 0 ? `Этот аккаунт уже привязан к VATSIM CID ${userCheck.cid}. Вы не можете его отвязать или переместить на другую учётную запись самостоятельно, пожалуйста обратитесь к администрации сервера.` : `This account is already connected to VATSIM CID ${userCheck.cid}. You cannot disconnect it or connect it to any other VATSIM CID yourself. Please contact the server\'s administrators.`);
        message.member?.setNickname(`${userCheck.full_vatsim_data.name_first} ${userCheck.full_vatsim_data.name_last} - ${userCheck.cid}`).catch(() => null);
        message.member?.roles.add(vatRole);
        return null;
      }

      const idCheck = await authScript.findOne({
        cid,
        guildID: message.guild.id
      });

      if (idCheck) {
        return message.reply(currLang.lang === 0 ? 'Этот VATSIM CID уже привязан к одному из аккаунтов на этом сервере. Эх, жаль, систему не проведёшь...' : 'This VATSIM CID is already connected to some other Discord account. You can\'t fool the system, can you?');
      }

      let VATmember = await axios.get<any, AxiosResponse<vatsimData>>(`https://api.vatsim.net/api/ratings/${cid}/`);

      if (VATmember.data.susp_date || VATmember.data.rating < 1) {
        return message.reply(currLang.lang === 0 ? 'Произошла ошибка при вашей Аутентификации. Данный аккаунт VATSIM является неактивным или забаненым.' : 'There was an error trying to authenticate you. This VATSIM account is either inactive or suspended.');
      }

      const newMember = new authScript({
        cid,
        discordID: message.author.id,
        guildID: message.guild.id,
        full_vatsim_data: VATmember.data
      });

      await newMember.save();
      message.member?.roles.add(vatRole);
      message.member?.setNickname(`${VATmember.data.name_first} ${VATmember.data.name_last} - ${VATmember.data.id}`).catch(() => null);

      return message.reply(currLang.lang === 0 ? `Вы были успешно аутентифицированы как ${VATmember.data.name_first} ${VATmember.data.name_last} (CID ${VATmember.data.id}). Добро пожаловать!` : `You were successfully authenticated as ${VATmember.data.name_first} ${VATmember.data.name_last} (CID ${VATmember.data.id}). Welcome!`);
    } catch (err) {
      return message.reply(currLang.lang === 0 ? 'Произошла ошибка при вашей Аутентификации. Пожалуйста обратитесь к администрации сервера.' : 'There was an error during your authentication. Please contact the server\'s administrators.');
    }
  }
}