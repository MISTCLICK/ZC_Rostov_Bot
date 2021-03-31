import mongoose, { Schema, Document } from 'mongoose';

interface muteUnit {
  author: string,
  timeStamp: number,
  duration: number,
  reason: string
}

interface muteStructure extends Document {
  guildID: string,
  userID: string,
  current: Boolean,
  mutes: muteUnit[]
}

const muteScript: Schema = new mongoose.Schema({
  guildID: { type: String, required: true },
  userID: { type: String, required: true },
  current: { type: Boolean, required: true },
  mutes: { type: [Object], required: true }
});

export = mongoose.model<muteStructure>('mutes', muteScript);