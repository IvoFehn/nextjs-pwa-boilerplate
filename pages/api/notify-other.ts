// pages/api/notify-others.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Subscription from "@/models/Subscription"; // Ihr Subscription-Modell
import webpush from "web-push";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Nur POST-Anfragen zulassen
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Methode nicht erlaubt" });
  }

  try {
    // Verbindung zur Datenbank herstellen
    await dbConnect();

    // Parameter aus der Anfrage extrahieren
    const { userName, catName = "Pebbles", time } = req.body;

    // API-Schlüssel zur Sicherheit überprüfen
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;
    if (apiKey !== process.env.REMINDER_API_KEY) {
      return res.status(401).json({ error: "Unberechtigter Zugriff" });
    }

    // Alle Abonnements abrufen (außer des aktuellen Benutzers)
    const subscriptions = await Subscription.find({
      userId: { $ne: req.body.userId }, // Ausschließen des aktuellen Benutzers
    });

    if (subscriptions.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Keine Abonnements gefunden",
      });
    }

    // Benachrichtigungsinhalt
    const notificationPayload = JSON.stringify({
      title: "Spray-Erinnerung aktualisiert",
      body: `${userName} hat gerade Pebbles das Spray gegeben.`,
      icon: "/android-chrome-192x192.png",
      link: "/",
    });

    // Benachrichtigungen an alle anderen Abonnements senden
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, notificationPayload);
          return { success: true };
        } catch (error: any) {
          console.error("Fehler beim Senden der Benachrichtigung:", error);

          // Bei ungültigem Abonnement entfernen
          if (error.statusCode === 404 || error.statusCode === 410) {
            await Subscription.deleteOne({
              endpoint: subscription.endpoint,
            });
            return {
              success: false,
              removed: true,
            };
          }

          return { success: false };
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
      message: `${sent} Benachrichtigungen gesendet`,
    });
  } catch (error) {
    console.error("Fehler beim Senden der Benachrichtigungen:", error);
    return res.status(500).json({ error: "Serverfehler" });
  }
}
