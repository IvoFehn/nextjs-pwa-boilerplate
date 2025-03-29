// models/Settings.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISettingsData {
  dailyFrequency: number;
  scheduledTimes: string[];
}

export interface ISettings extends Document {
  _id: string;
  settings: ISettingsData;
}

const settingsSchema = new Schema<ISettings>({
  _id: { type: String, required: true },
  settings: {
    dailyFrequency: { type: Number, default: 2 },
    scheduledTimes: { type: [String], default: ["08:00", "20:00"] },
  },
});

// Typsichere Modelldefinition mit Generic
const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", settingsSchema);

export default Settings;
