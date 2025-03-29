// pages/api/cat-spray/settings.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../utils/connectDB";
import Settings, { ISettings } from "../../../models/Settings";

interface SettingsData {
  dailyFrequency: number;
  scheduledTimes: string[];
}

interface ResponseData {
  success?: boolean;
  settings?: SettingsData | null;
  message?: string;
}

// Standard-Einstellungen als Fallback
const DEFAULT_SETTINGS: SettingsData = {
  dailyFrequency: 2,
  scheduledTimes: ["08:00", "20:00"],
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  await connectDB();

  if (req.method === "GET") {
    try {
      // Explizite Typisierung mit Type-Assertion
      const settingsDoc = (await Settings.findOne({
        _id: "spraySettings",
      }).lean()) as unknown as ISettings | null;

      // Wenn keine Einstellungen gefunden wurden, Standard-Einstellungen zurückgeben
      if (!settingsDoc || !settingsDoc.settings) {
        return res.status(200).json({ settings: DEFAULT_SETTINGS });
      }

      // Sicheres Extrahieren der Werte
      const settings: SettingsData = {
        dailyFrequency:
          typeof settingsDoc.settings.dailyFrequency === "number"
            ? settingsDoc.settings.dailyFrequency
            : DEFAULT_SETTINGS.dailyFrequency,
        scheduledTimes: Array.isArray(settingsDoc.settings.scheduledTimes)
          ? settingsDoc.settings.scheduledTimes
          : DEFAULT_SETTINGS.scheduledTimes,
      };

      res.status(200).json({ settings });
    } catch (error) {
      console.error("Fehler beim Laden der Einstellungen:", error);
      // Bei Fehler Standard-Einstellungen zurückgeben
      res.status(200).json({
        settings: DEFAULT_SETTINGS,
        message: "Fehler beim Laden, Standardeinstellungen werden verwendet",
      });
    }
  } else if (req.method === "POST") {
    try {
      const { settings }: { settings: SettingsData } = req.body;

      // Validierung
      if (
        !settings ||
        typeof settings.dailyFrequency !== "number" ||
        !Array.isArray(settings.scheduledTimes)
      ) {
        return res.status(400).json({
          success: false,
          message: "Ungültiges Einstellungs-Format",
        });
      }

      await Settings.findOneAndUpdate(
        { _id: "spraySettings" },
        { settings },
        { upsert: true }
      );

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
      res.status(500).json({
        success: false,
        message: "Fehler beim Speichern der Einstellungen",
      });
    }
  } else {
    res.status(405).json({
      success: false,
      settings: DEFAULT_SETTINGS,
      message: "Method not allowed",
    });
  }
}
