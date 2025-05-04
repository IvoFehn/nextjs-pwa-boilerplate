// models/Counter.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICounter extends Document {
  _id: string;
  count: number;
  resetDate?: Date;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  count: { type: Number, default: 0 },
  resetDate: { type: Date },
});

// Typsichere Modelldefinition mit Generic
const Counter: Model<ICounter> =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);

export default Counter;
