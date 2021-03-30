import mongoose, { Document } from 'mongoose';

interface permaBookInt extends Document {
  guildID: string;
  channelID: string;
}

const permaBookScript = new mongoose.Schema({
  channelID: { type: String, required: true },
  guildID: { type: String, required: true },
});

export default mongoose.model<permaBookInt>('permaBookConfig', permaBookScript);