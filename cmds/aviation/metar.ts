import axios from 'axios';
import langScript from '../../schema/langSchema';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

interface thisArgs {
  airport: string;
}

export default class MetarCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'metar',
      description: 'Выдаёт МЕТАР аэропорта. | Gives out airport\'s METAR.',
      memberName: 'metar',
      group: 'aviation',
      aliases: ['m'],
      args: [{
        key: 'airport',
        type: 'string',
        default: '',
        prompt: 'Предоставьте ИКАО код из 4 букв, пожалуйста! | Please provide a 4 letter long ICAO code.'
      }]
    });
  }

  async run(message: CommandoMessage, { airport }: thisArgs) {
    const currLang = await langScript.findOne({ ver: 0 });
    try {
      if (airport.length !== 4) return message.reply(currLang.lang === 0 ? 'Предоставьте ИКАО код из 4 букв, пожалуйста!' : 'Please provide a 4 letter long ICAO code.');
      let metar = await axios.get(`http://metartaf.ru/${airport.toUpperCase()}.json`);
      if (metar.data.metar.slice(20).startsWith(airport.toUpperCase())) {
        let newMetar = metar.data.metar.slice(19);
        return message.reply('```' + newMetar + '```')
      }
      return message.reply('```' + metar.data.metar + '```');
    } catch (err) {
      return message.reply(currLang.lang === 0 ? 'Такой аэропорт не был найден!' : 'Such airport was not found!')
    }
  }
}