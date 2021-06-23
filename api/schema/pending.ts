import mongoose, { Document } from 'mongoose';

interface PendingUser extends Document {
  discordUserID: string;
  guildID: string;
  code: string;
  expires: number;
}

const pendingUserSchema = new mongoose.Schema({
  discordUserID: { type: String, required: true },
  guildID: { type: String, required: true },
  code: { type: String, required: false, default: '' },
  expires: { type: Number, required: true }
});

export default mongoose.model<PendingUser>('pending', pendingUserSchema);