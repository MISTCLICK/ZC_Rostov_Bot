import langScript from '../../schema/langSchema';
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class LangCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'lang',
      memberName: 'lang',
      description: 'Изменяет язык бота.',
      group: 'misc'
    });
  }

  async run(message: CommandoMessage) {
    const currLang = await langScript.findOne({ ver: 0 });
    const newLang = currLang ? currLang.lang === 0 ? 1 : 0 : 0;
    await langScript.findOneAndUpdate({ ver: 0 }, { lang: newLang }, { upsert: true });
    return message.reply(newLang === 0 ? 'Язык был изменён на РУССКИЙ.' : 'Language was changed to ENGLISH.');
  }
}