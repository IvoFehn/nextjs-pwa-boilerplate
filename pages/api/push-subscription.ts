import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import webpush from "web-push";
import mongoose from "mongoose";

// VAPID-Keys für den Server
const vapidDetails = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: `mailto:${
    process.env.VAPID_EMAIL_ADDRESS || "example@yourdomain.com"
  }`,
};

// Web-Push-Konfiguration
webpush.setVapidDetails(
  vapidDetails.subject,
  vapidDetails.publicKey as string,
  vapidDetails.privateKey as string
);

// Subscription-Schema definieren
const SubscriptionSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: String,
      default: null,
    },
    // Hinzufügen von Geräteinformationen für bessere Analysemöglichkeiten
    userAgent: {
      type: String,
      default: null,
    },
    platform: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Modell erstellen oder abrufen
const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS-Header hinzufügen (wichtig für iOS Safari)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // OPTIONS-Anfragen für CORS-Preflight beantworten
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Verbindung zur Datenbank herstellen
  await dbConnect();

  // POST: Neues Abonnement speichern
  if (req.method === "POST") {
    try {
      const subscription = req.body;

      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: "Ungültiges Abonnement" });
      }

      // Extrahieren von User-Agent-Informationen (falls vorhanden)
      const userAgent = req.headers["user-agent"] || null;

      // Geräteplattform erkennen
      let platform = "other";
      if (userAgent) {
        if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
          platform = "ios";
        } else if (userAgent.includes("Android")) {
          platform = "android";
        } else if (userAgent.includes("Windows")) {
          platform = "windows";
        } else if (userAgent.includes("Mac")) {
          platform = "mac";
        }
      }

      // Prüfen, ob das Abonnement bereits existiert
      const existing = await Subscription.findOne({
        endpoint: subscription.endpoint,
      });

      if (existing) {
        // Abonnement aktualisieren
        await Subscription.updateOne(
          { endpoint: subscription.endpoint },
          {
            $set: {
              ...subscription,
              userAgent,
              platform,
              updatedAt: new Date(),
            },
          }
        );
      } else {
        // Neues Abonnement hinzufügen
        await Subscription.create({
          ...subscription,
          userId: req.body.userId || null,
          userAgent,
          platform,
        });
      }

      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("Fehler beim Speichern des Abonnements:", error);
      return res.status(500).json({ error: "Serverfehler" });
    }
  }

  // DELETE: Abonnement entfernen
  if (req.method === "DELETE") {
    try {
      const { endpoint } = req.body;

      if (!endpoint) {
        return res.status(400).json({ error: "Ungültiger Endpunkt" });
      }

      // Abonnement aus der Datenbank entfernen
      await Subscription.deleteOne({ endpoint });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Fehler beim Entfernen des Abonnements:", error);
      return res.status(500).json({ error: "Serverfehler" });
    }
  }

  // Methode nicht unterstützt
  return res.status(405).json({ error: "Methode nicht erlaubt" });
}
