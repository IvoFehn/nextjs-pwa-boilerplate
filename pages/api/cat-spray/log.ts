// pages/api/cat-spray/log.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../utils/connectDB";
import SprayLog from "../../../models/SprayLog";
import Counter from "../../../models/Counter";

interface LogData {
  userId: string;
  userName: string;
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

    const { userId, userName, timestamp }: LogData = req.body;

    // Validerung
    if (!userId || !userName) {
      return res
        .status(400)
        .json({ message: "userId und userName sind erforderlich" });
    }

    // Neuen Spray-Eintrag speichern
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
