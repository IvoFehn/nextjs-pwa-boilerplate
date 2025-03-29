// pages/api/cat-spray/last.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../utils/connectDB";
import SprayLog from "../../../models/SprayLog";

interface SprayLogResponse {
  userId?: string;
  userName?: string;
  timestamp?: string;
  _id?: string;
}

type ResponseData = SprayLogResponse | { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    // Suche nach dem letzten Eintrag, sortiert nach Zeitstempel in absteigender Reihenfolge
    const lastSpray = await SprayLog.findOne().sort({ timestamp: -1 }).lean();

    if (!lastSpray) {
      return res.status(404).json({ message: "Kein Spray-Eintrag gefunden" });
    }

    // Explizite Umwandlung des Mongoose-Objekts in unser Response-Format
    const response: SprayLogResponse = {
      _id: lastSpray._id?.toString(),
      userId: lastSpray.userId,
      userName: lastSpray.userName,
      timestamp: lastSpray.timestamp?.toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
