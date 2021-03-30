import mongoose from "mongoose";

interface bookingInt extends mongoose.Document {
  cid: string;
  pos: string;
  from: string;
  till: string;
  ver: number;
}

const bookingSchema = new mongoose.Schema({
  cid: { type: String, required: true },
  pos: { type: String, required: true },
  from: { type: String, required: true },
  till: { type: String, required: true },
  ver: { type: Number, required: true }
});

export default mongoose.model<bookingInt>('bookings', bookingSchema);