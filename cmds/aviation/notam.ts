import Commando, { CommandoClient, CommandoMessage } from 'discord.js-commando';
import axios from 'axios';
import { notamkey, mainColor, mainFooter } from '../../config.json';
import { MessageEmbed } from 'discord.js';

export default class NOTAMcommand extends Commando.Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'notam',
      group: 'aviation',
      memberName: 'notam',
      description: 'A command to get NOTAM of a certain airport.',
      args: [
        {
          key: 'airport',
          prompt: "What airport's metar would you like to get?",
          type: 'string',
          validate: (text: string) => text.length === 4
        }
      ],
      argsCount: 1,
      examples: ['!notam EVRA']
    });
  }

  async run(message: CommandoMessage, args: any) {
    let getNOTAM = async () => {
      let airportString = args.airport;
      let airportCode = airportString.toUpperCase();
      let NOTAMURL = `https://applications.icao.int/dataservices/api/notams-realtime-list?api_key=${notamkey}&format=&criticality=&locations=${airportCode}`;
      let notams = await axios.get(NOTAMURL);
      return notams;
    }
    let notamValue = await getNOTAM().catch(() => null);
    //@ts-ignore
    for (const notam of notamValue.data) {
      const notamember = new MessageEmbed()
      .setColor(mainColor)
      .setAuthor(`NOTAM for ${args.airport.toUpperCase()}`, this.client.user?.displayAvatarURL(), 'http://veuroexpress.org')
      .setDescription(notam.all)
      .setFooter(mainFooter, this.client.user?.displayAvatarURL())

      message.author.send(notamember);
    }

    //@ts-ignore
    if (notamValue.data[0].all) {
      message.reply('sent you a DM with information.');
    }

    return null;
  }
}