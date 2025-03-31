import dbConnect from "@/lib/dbConnect";
import type { NextApiRequest, NextApiResponse } from "next";
import webpush from "web-push";
import mongoose from "mongoose";

// VAPID-Details konfigurieren
const vapidDetails = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: `mailto:${process.env.VAPID_EMAIL_ADDRESS || "test@test.de"}`,
};

// Web-Push-Konfiguration
webpush.setVapidDetails(
  vapidDetails.subject,
  vapidDetails.publicKey as string,
  vapidDetails.privateKey as string
);

// Subscription Model definieren (falls noch nicht vorhanden)
const SubscriptionSchema = new mongoose.Schema(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userId: { type: String, default: null }, // Optional: Benutzer-ID hinzufügen
    lastNotificationAttempt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // API-Schlüssel zur Sicherheit überprüfen
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  if (apiKey !== process.env.REMINDER_API_KEY) {
    return res.status(401).json({ error: "Unberechtigter Zugriff" });
  }

  try {
    // Parameter aus der Anfrage extrahieren
    const title = (req.query.title as string) || "Test Benachrichtigung";
    const message =
      (req.query.message as string) ||
      "Dies ist eine Test-Benachrichtigung für die Katzen-Spray App!";
    const icon = (req.query.icon as string) || "/android-chrome-192x192.png";
    const userId = req.query.userId as string | undefined;

    // Verbindung zur Datenbank herstellen
    await dbConnect();

    // Abonnements abrufen (optional gefiltert nach Benutzer-ID)
    const query = userId ? { userId } : {};
    const subscriptions = await Subscription.find(query);

    if (subscriptions.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Keine Abonnements gefunden. Keine Benachrichtigung gesendet.",
        userId: userId || "Alle Benutzer",
      });
    }

    // Benachrichtigungsinhalt
    const notificationPayload = JSON.stringify({
      title: title,
      body: message,
      icon: icon,
      link: "/", // Link zur Hauptseite
    });

    // Benachrichtigungen an alle Abonnements senden
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription: any) => {
        try {
          await webpush.sendNotification(subscription, notificationPayload);

          // Aktualisiere den Zeitpunkt des letzten Benachrichtigungsversuchs
          await Subscription.updateOne(
            { _id: subscription._id },
            { lastNotificationAttempt: new Date() }
          );

          return {
            success: true,
            endpoint: subscription.endpoint,
            userId: subscription.userId,
          };
        } catch (error: any) {
          console.error("Fehler beim Senden der Benachrichtigung:", error);

          // Bei ungültigem Abonnement aus der Datenbank entfernen
          if (error.statusCode === 404 || error.statusCode === 410) {
            await Subscription.deleteOne({
              endpoint: subscription.endpoint,
            });
            return {
              success: false,
              removed: true,
              endpoint: subscription.endpoint,
              userId: subscription.userId,
              error: error.message,
            };
          }

          return {
            success: false,
            endpoint: subscription.endpoint,
            userId: subscription.userId,
            error: error.message,
          };
        }
      })
    );

    // Ergebnisse zählen
    const sent = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).success
    ).length;
    const failed = results.filter(
      (r) => r.status === "rejected" || !(r.value as any).success
    ).length;
    const removed = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).removed
    ).length;

    return res.status(200).json({
      success: true,
      sent,
      failed,
      removed,
      total: subscriptions.length,
      userId: userId || "Alle Benutzer",
      message: `${sent} Test-Benachrichtigungen gesendet.`,
    });
  } catch (error) {
    console.error("Fehler beim Senden der Test-Benachrichtigung:", error);
    return res.status(500).json({ error: "Serverfehler" });
  }
}
