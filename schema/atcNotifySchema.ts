import mongoose, { Document } from 'mongoose';

interface atcNotifyInt extends Document {
  guildID: string;
  channelID: string;
}

const atcNotifyScript = new mongoose.Schema({
  channelID: { type: String, required: true },
  guildID: { type: String, required: true },
});

export default mongoose.model<atcNotifyInt>('atc_notifications', atcNotifyScript);