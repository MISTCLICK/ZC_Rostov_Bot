import mongoose, { Document } from 'mongoose';

interface vatsimData {
  id: string;
  rating: number;
  pilotrating: number;
  name_first: string;
  name_last: string;
  age: number;
  countystate: string;
  country: string;
  susp_date?: any;
  reg_date: Date;
  region: string;
  division: string;
  subdivision: string;
}

interface vatsimAuthINT extends Document {
  cid: string;
  discordID: string;
  guildID: string;
  full_vatsim_data: vatsimData;
}

const vatsimAuthScript = new mongoose.Schema({
  cid: { type: String, required: true },
  discordID: { type: String, required: true },
  guildID: { type: String, required: true },
  full_vatsim_data: { type: Object, required: true }
});

export default mongoose.model<vatsimAuthINT>('vatsimAuth', vatsimAuthScript);