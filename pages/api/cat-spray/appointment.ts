// pages/api/cat-spray/appointment.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../utils/connectDB";
import Appointment from "../../../models/Appointment";
import SprayLog from "../../../models/SprayLog";
import Counter from "../../../models/Counter";

interface AppointmentData {
  userId: string;
  userName: string;
  time: string;
  date: string;
  timestamp: string;
}

interface ResponseData {
  success?: boolean;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { userId, userName, time, date, timestamp }: AppointmentData =
      req.body;

    // Validierung
    if (!userId || !userName || !time || !date) {
      return res.status(400).json({
        message: "userId, userName, time und date sind erforderlich",
      });
    }

    // Prüfen, ob für diesen Termin bereits ein Eintrag existiert
    const existingAppointment = await Appointment.findOne({
      date,
      time,
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: "Für diesen Termin wurde bereits ein Eintrag erstellt",
      });
    }

    // Neuen Termin-Eintrag speichern
    const appointment = new Appointment({
      userId,
      userName,
      time,
      date,
      timestamp: new Date(timestamp || Date.now()),
    });
    await appointment.save();

    // Auch in den normalen Spray-Log eintragen
    const sprayLog = new SprayLog({
      userId,
      userName,
      timestamp: new Date(timestamp || Date.now()),
    });
    await sprayLog.save();

    // Zähler erhöhen
    await Counter.findOneAndUpdate(
      { _id: "sprayCounter" },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
