// models/SprayLog.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISprayLog extends Document {
  userId: string;
  userName: string;
  timestamp: Date;
}

const sprayLogSchema = new Schema<ISprayLog>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Typsichere Modelldefinition mit Generic
const SprayLog: Model<ISprayLog> =
  mongoose.models.SprayLog ||
  mongoose.model<ISprayLog>("SprayLog", sprayLogSchema);

export default SprayLog;
