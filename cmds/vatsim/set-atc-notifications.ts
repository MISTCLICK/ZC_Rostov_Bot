import atcNotifyScript from '../../schema/atcNotifySchema';
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

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

interface thisArgs {
  channelTag: string;
}

export default class SetPermaBookCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "set-atc-notifications",
      group: "vatsim",
      memberName: "set-atc-notifications",
      description: "Определяет канал для оповещении об открытии/закрытии УВД позиций.",
      guildOnly: true,
      args: [
        {
          key: "channelTag",
          prompt: "Пожалуйста тэгните канал для оповещении об открытии/закрытии УВД позиций.",
          type: "string"
        }
      ],
      userPermissions: ["ADMINISTRATOR"]
    });
  }

  async run(message: CommandoMessage, { channelTag }: thisArgs) {
    const channelID = channelTag.slice(2, -1);
    const guildID = message.guild.id;

    await atcNotifyScript.findOneAndUpdate({
      guildID
    }, {
      guildID,
      channelID
    }, {
      upsert: true,
      useFindAndModify: false
    });

    return message.reply('Операция успешно завершена!');
  }
}