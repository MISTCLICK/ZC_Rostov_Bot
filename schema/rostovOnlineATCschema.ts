import mongoose, { Document } from 'mongoose';

interface atcOnlneInt extends Document {
  info: {
    found: number;
  },
  result: any;
  permanent: number;
}

const atcOnlineListScript = new mongoose.Schema({
  info: { type: Object, required: true },
  result: { type: Object, required: true },
  permanent: { type: Number, required: true }
});

export default mongoose.model<atcOnlneInt>('atcOnlineRostov', atcOnlineListScript);