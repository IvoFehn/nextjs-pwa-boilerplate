import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import webpush from "web-push";
import mongoose from "mongoose";
import {
  NotificationPayload,
  SendNotificationResult,
} from "../../types/pushNotifications";

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

// Subscription-Schema definieren (falls noch nicht vorhanden)
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
    userId: {
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
  // Nur POST-Anfragen zulassen
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Methode nicht erlaubt" });
  }

  try {
    const { title, body, link, userId } = req.body as NotificationPayload & {
      userId?: string;
    };

    if (!title || !body) {
      return res
        .status(400)
        .json({ error: "Titel und Inhalt sind erforderlich" });
    }

    // Verbindung zur Datenbank herstellen
    await dbConnect();

    // Abfrage bauen
    let query = {};

    // Falls eine Benutzer-ID angegeben wurde, nur an diesen Benutzer senden
    if (userId) {
      query = { userId };
    }

    // Alle aktiven Abonnements abrufen
    const subscriptions = await Subscription.find(query);

    if (subscriptions.length === 0) {
      return res.status(404).json({ error: "Keine Abonnements gefunden" });
    }

    // Benachrichtigungsinhalt
    const notificationPayload = JSON.stringify({
      title,
      body,
      link: link || "/",
    });

    // Benachrichtigungen an alle Abonnements senden
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription: any) => {
        try {
          await webpush.sendNotification(subscription, notificationPayload);
          return {
            success: true,
            endpoint: subscription.endpoint,
          } as SendNotificationResult;
        } catch (error: any) {
          console.error("Fehler beim Senden der Benachrichtigung:", error);

          // Bei ungültigem Abonnement (410 Gone) aus der Datenbank entfernen
          if (error.statusCode === 404 || error.statusCode === 410) {
            await Subscription.deleteOne({
              endpoint: subscription.endpoint,
            });
            return {
              success: false,
              endpoint: subscription.endpoint,
              removed: true,
              error: error.message,
            } as SendNotificationResult;
          }

          return {
            success: false,
            endpoint: subscription.endpoint,
            error: error.message,
          } as SendNotificationResult;
        }
      })
    );

    // Ergebnisse zählen
    const sent = results.filter(
      (r) =>
        r.status === "fulfilled" && (r.value as SendNotificationResult).success
    ).length;
    const failed = results.filter(
      (r) =>
        r.status === "rejected" || !(r.value as SendNotificationResult).success
    ).length;
    const removed = results.filter(
      (r) =>
        r.status === "fulfilled" && (r.value as SendNotificationResult).removed
    ).length;

    return res.status(200).json({
      success: true,
      sent,
      failed,
      removed,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Fehler beim Senden der Benachrichtigungen:", error);
    return res.status(500).json({ error: "Serverfehler" });
  }
}
