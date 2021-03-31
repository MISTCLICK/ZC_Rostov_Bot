import mongoose, { Document } from 'mongoose';

interface warn {
  author: string,
  timeStamp: number,
  reason: string
}

interface warnINT extends Document {
  guildID: string,
  userID: string,
  warns: warn[]
}

const warnScript = new mongoose.Schema({
  guildID: { type: String, required: true },
  userID: { type: String, required: true },
  warns: { type: [Object], required: true }
});

//Structure of [Object]
/*
{
  author: String,
  timeStamp: Number,
  reason: String
}
*/

export = mongoose.model<warnINT>('warns', warnScript);