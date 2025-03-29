// models/Appointment.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAppointment extends Document {
  userId: string;
  userName: string;
  time: string;
  date: string;
  timestamp: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  time: { type: String, required: true }, // Format: "HH:MM"
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  timestamp: { type: Date, default: Date.now },
});

// Typsichere Modelldefinition mit Generic
const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", appointmentSchema);

export default Appointment;
