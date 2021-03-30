import axios from 'axios';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

interface thisArgs {
  airport: string;
}

export default class MetarCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'metar',
      description: 'Выдаёт МЕТАР аэропорта.',
      memberName: 'metar',
      group: 'aviation',
      aliases: ['m'],
      args: [{
        key: 'airport',
        type: 'string',
        default: '',
        prompt: 'Предоставьте ИКАО код из 4 букв, пожалуйста!'
      }]
    });
  }

  async run(message: CommandoMessage, { airport }: thisArgs) {
    try {
      if (airport.length !== 4) return message.reply('Предоставьте ИКАО код из 4 букв, пожалуйста!');
      let metar = await axios.get(`http://metartaf.ru/${airport.toUpperCase()}.json`);
      if (metar.data.metar.slice(20).startsWith(airport.toUpperCase())) {
        let newMetar = metar.data.metar.slice(19);
        return message.reply('```' + newMetar + '```')
      }
      return message.reply('```' + metar.data.metar + '```');
    } catch (err) {
      return message.reply('Такой аэропорт не был найден!')
    }
  }
}