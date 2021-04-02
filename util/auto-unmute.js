"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const muteScript_1 = __importDefault(require("../schema/muteScript"));
exports.default = async (client) => {
    const data = await muteScript_1.default.find({
        current: true,
        mutes: {
            $elemMatch: {
                duration: {
                    $lte: new Date().getTime()
                }
            }
        }
    });
    if (data === null)
        return;
    for (const mute of data) {
        const guild = client.guilds.cache.get(mute.guildID);
        const member = guild?.members.cache.get(mute.userID);
        const mutedRole = guild?.roles.cache.find((role) => {
            return role.name === 'Muted';
        });
        if (!mutedRole)
            return;
        member?.roles.remove(mutedRole);
        await muteScript_1.default.findOneAndUpdate({
            guildID: mute.guildID,
            userID: mute.userID
        }, {
            current: false,
            mutes: []
        }, {
            upsert: true
        });
    }
};
