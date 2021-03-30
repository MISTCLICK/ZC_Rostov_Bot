import mongoose from 'mongoose';

interface authorizationINT extends mongoose.Document {
  token: string;
  allowedSource: string;
  privileges: number;
  active: boolean;
}

const authorizationSchema = new mongoose.Schema({
  token: { type: String, required: true },
  allowedSource: { type: String, required: true },
  privileges: { type: Number, default: 0 },
  active: { type: Boolean, default: false }
});

export default mongoose.model<authorizationINT>('tokens', authorizationSchema);