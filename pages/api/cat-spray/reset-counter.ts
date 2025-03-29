// pages/api/cat-spray/reset-counter.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../utils/connectDB";
import Counter from "../../../models/Counter";

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

    // Zähler auf 0 zurücksetzen
    await Counter.findOneAndUpdate(
      { _id: "sprayCounter" },
      { count: 0 },
      { upsert: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
