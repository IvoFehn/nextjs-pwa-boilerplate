// pages/api/cat-spray/appointments.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../utils/connectDB";
import Appointment from "../../../models/Appointment";

interface AppointmentData {
  _id?: string;
  userId: string;
  userName: string;
  time: string;
  date: string;
  timestamp?: string;
}

interface ResponseData {
  appointments: AppointmentData[];
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      appointments: [], // Immer ein leeres Array zurückgeben, wenn ein Fehler auftritt
      message: "Method not allowed",
    });
  }

  try {
    await connectDB();

    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return res.status(400).json({
        appointments: [], // Leeres Array statt undefined
        message: "Ein gültiges Datum muss angegeben werden",
      });
    }

    // Suche nach allen Terminen für das angegebene Datum
    const appointmentsRaw = await Appointment.find({ date }).lean();

    // Manuelle Umwandlung der Mongoose-Objekte in unser Response-Format
    const appointments: AppointmentData[] = appointmentsRaw.map((app) => ({
      _id: app._id?.toString(),
      userId: app.userId || "",
      userName: app.userName || "",
      time: app.time || "",
      date: app.date || "",
      timestamp: app.timestamp?.toISOString(),
    }));

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      appointments: [], // Leeres Array statt undefined
      message: "Server error",
    });
  }
}
