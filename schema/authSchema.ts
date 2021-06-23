import mongoose, { Document } from 'mongoose';

export interface vatsimData {
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

export interface Personal {
  name_first: string;
  name_last: string;
  name_full: string;
  email: string;
}

export interface Rating {
  id: number;
  long: string;
  short: string;
}

export interface Pilotrating {
  id: number;
  long: string;
  short: string;
}

export interface Division {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface Subdivision {
  id: string;
  name: string;
}

export interface Vatsim {
  rating: Rating;
  pilotrating: Pilotrating;
  division: Division;
  region: Region;
  subdivision: Subdivision;
}

export interface NewVatsimData {
  cid: string;
  personal: Personal;
  vatsim: Vatsim;
}

interface vatsimAuthINT extends Document {
  cid: string;
  discordID: string;
  guildID: string;
  full_vatsim_data: vatsimData | NewVatsimData;
  dataType: 'old' | 'new';
}

const vatsimAuthScript = new mongoose.Schema({
  cid: { type: String, required: true },
  discordID: { type: String, required: true },
  guildID: { type: String, required: true },
  full_vatsim_data: { type: Object, required: true },
  dataType: { type: String, default: 'old' }
});

export default mongoose.model<vatsimAuthINT>('vatsimAuth', vatsimAuthScript);