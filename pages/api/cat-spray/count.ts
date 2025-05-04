// pages/api/cat-spray/count.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../utils/connectDB";
import Counter, { ICounter } from "../../../models/Counter";

interface ResponseData {
  count: number;
  resetDate?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      count: 0, // Standardwert bei Fehler
      message: "Method not allowed",
    });
  }

  try {
    await connectDB();

    // Suche nach dem Spray-Zähler mit explizitem Typ-Casting
    const sprayCounter = (await Counter.findOne({
      _id: "sprayCounter",
    }).lean()) as unknown as ICounter | null;

    // Wenn kein Zähler gefunden wurde oder count nicht definiert ist, gib 0 zurück
    if (!sprayCounter || typeof sprayCounter.count !== "number") {
      return res.status(200).json({ count: 0 });
    }

    res
      .status(200)
      .json({
        count: sprayCounter.count,
        resetDate: sprayCounter.resetDate
          ? sprayCounter.resetDate.toISOString()
          : undefined,
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      count: 0,
      message: "Server error",
    });
  }
}
