import { CommandoClient } from "discord.js-commando";
import welcomeScript from "../schema/welcomeScript";

export default (client: CommandoClient) => {
  client.on('guildMemberAdd', async member => {
    const guildID = member.guild.id;
    const data = await welcomeScript.findOne({
      guildID
    });

    if (data == null) return;

    //@ts-ignore
    if (data.settingsObj.welcome.channelID !== null) {
      //@ts-ignore
      const channel: any = client.channels.cache.get(data.settingsObj.welcome.channelID);
      //@ts-ignore
      channel?.send(`${member}, ${data.settingsObj.welcome.text}`);
      //@ts-ignore
      if (data.settingsObj.welcome.role !== null) {
        //@ts-ignore
        member.roles.add(data.settingsObj.welcome.role);
      }
    }
  });

  client.on('guildMemberRemove', async member => {
    const guildID = member.guild.id;
    const data = await welcomeScript.findOne({
      guildID
    });

    if (data == null) return;

    //@ts-ignore
    if (data.settingsObj.leave.channelID !== null) {
      //@ts-ignore
      const channel: any = client.channels.cache.get(data.settingsObj.leave.channelID);
      //@ts-ignore
      channel?.send(`**${member.nickname || member.user.username}** ${data.settingsObj.leave.text}`);
    }
  });
}