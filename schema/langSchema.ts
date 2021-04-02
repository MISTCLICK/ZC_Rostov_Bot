import mongoose from "mongoose";

const langSchema = new mongoose.Schema({
  lang: { type: Number, default: 0 },
  ver: { type: Number, default: 0 }
});
export default mongoose.model('bot_lang', langSchema);