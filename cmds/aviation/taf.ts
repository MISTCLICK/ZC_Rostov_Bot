import axios from 'axios';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

interface thisArgs {
  airport: string;
}

export default class MetarCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'taf',
      description: 'Выдаёт ТАФ аэропорта.',
      memberName: 'taf',
      group: 'aviation',
      aliases: ['t'],
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
      let taf = await axios.get(`http://metartaf.ru/${airport.toUpperCase()}.json`);
      if (taf.data.taf.slice(20).startsWith('TAF ' + airport.toUpperCase())) {
        let newTaf = taf.data.taf.slice(19);
        return message.reply('```' + newTaf + '```')
      }
      return message.reply('```' + taf.data.taf + '```');
    } catch (err) {
      return message.reply('Такой аэропорт не был найден!')
    }
  }
}