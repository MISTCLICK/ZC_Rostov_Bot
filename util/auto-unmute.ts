import { CommandoClient } from "discord.js-commando";
import muteScript from "../schema/muteScript";

export default async (client: CommandoClient) => {
  const data = await muteScript.find({
    current: true,
    mutes: {
      $elemMatch: {
        duration: { 
          $lte: new Date().getTime()
        }
      }
    }
  });
  if (data === null) return;
  for (const mute of data) {
    const guild = client.guilds.cache.get(mute.guildID);
    const member = guild?.members.cache.get(mute.userID);
    const mutedRole = guild?.roles.cache.find((role) => {
      return role.name === 'Muted';
    });
    if (!mutedRole) return;
    member?.roles.remove(mutedRole);
    await muteScript.findOneAndUpdate({
      guildID: mute.guildID,
      userID: mute.userID
    }, {
      current: false,
      mutes: []
    }, {
      upsert: true
    });
  }
}