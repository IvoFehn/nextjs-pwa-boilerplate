import dbConnect from "@/lib/dbConnect";
import type { NextApiRequest, NextApiResponse } from "next";
import webpush from "web-push";
import mongoose from "mongoose";

// VAPID-Details konfigurieren
const vapidDetails = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
  subject: `mailto:${
    process.env.VAPID_EMAIL_ADDRESS || "your-email@example.com"
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
  },
  { timestamps: true }
);

// Appointments-Schema definieren
const AppointmentSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Modelle erstellen oder abrufen
const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", AppointmentSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Prüfen, ob der Request mit einem API-Key autorisiert ist
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  if (apiKey !== process.env.REMINDER_API_KEY) {
    return res.status(401).json({ error: "Unberechtigter Zugriff" });
  }

  try {
    // Parameter aus der Anfrage extrahieren (Zeit, optional: Titel und Nachricht)
    const { time, title, message } = req.query;

    if (!time) {
      return res
        .status(400)
        .json({ error: "Zeit (time) ist ein Pflichtparameter" });
    }

    // Verbindung zur Datenbank herstellen
    await dbConnect();

    // Prüfen, ob der Termin bereits erledigt wurde
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD Format
    const completed = await Appointment.findOne({
      date: today,
      time: time as string,
    });

    if (completed) {
      return res.status(200).json({
        success: true,
        message: `Termin ${time} Uhr wurde bereits erledigt. Keine Benachrichtigung gesendet.`,
        completed: true,
      });
    }

    // Alle Abonnements abrufen
    const subscriptions = await Subscription.find({});

    if (subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Keine Abonnements gefunden. Keine Benachrichtigung gesendet.",
      });
    }

    // Benachrichtigungsinhalt
    const notificationTitle = (title as string) || "Katzen-Spray Erinnerung";
    const notificationMessage =
      (message as string) ||
      `Es ist Zeit für die ${time} Uhr Anwendung des Katzen-Sprays.`;

    const notificationPayload = JSON.stringify({
      title: notificationTitle,
      body: notificationMessage,
      link: "/", // Link zur Hauptseite
    });

    // Benachrichtigungen an alle Abonnements senden
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription: any) => {
        try {
          await webpush.sendNotification(subscription, notificationPayload);
          return { success: true };
        } catch (error: any) {
          console.error("Fehler beim Senden der Benachrichtigung:", error);

          // Bei ungültigem Abonnement (410 Gone) aus der Datenbank entfernen
          if (error.statusCode === 404 || error.statusCode === 410) {
            await Subscription.deleteOne({
              endpoint: subscription.endpoint,
            });
            return {
              success: false,
              removed: true,
              error: error.message,
            };
          }

          return {
            success: false,
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
      time: time,
      message: `${sent} Benachrichtigungen für ${time} Uhr gesendet.`,
    });
  } catch (error) {
    console.error("Fehler beim Senden der Spray-Erinnerungen:", error);
    return res.status(500).json({ error: "Serverfehler" });
  }
}
