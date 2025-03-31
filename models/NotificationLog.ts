import mongoose, { Document, Schema, Model } from "mongoose";
import { IAppointment } from "./Appointment";

export interface INotificationLog extends Document {
  appointmentId: mongoose.Types.ObjectId | IAppointment;
  sentAt: Date;
}

const NotificationLogSchema = new Schema<INotificationLog>({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  sentAt: { type: Date, default: Date.now },
});

const NotificationLog: Model<INotificationLog> =
  mongoose.models.NotificationLog ||
  mongoose.model<INotificationLog>("NotificationLog", NotificationLogSchema);

export default NotificationLog;
