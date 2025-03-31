import dbConnect from "@/lib/dbConnect";
import type { NextApiRequest, NextApiResponse } from "next";
import webpush from "web-push";
import Appointment from "@/models/Appointment";
import Subscription from "@/models/Subscription";
import NotificationLog from "@/models/NotificationLog";

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
    await dbConnect();
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Alle heutigen Termine abrufen
    const appointments = await Appointment.find({ date: today });
    if (appointments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Keine Termine für heute gefunden",
      });
    }

    let totalSent = 0;
    let totalFailed = 0;
    let totalRemoved = 0;

    // Für jeden Termin prüfen und ggf. Benachrichtigungen senden
    for (const appointment of appointments) {
      // Zeitfensterüberprüfung
      if (!isWithinTimeWindow(appointment.time, now)) continue;

      // Prüfen ob Benachrichtigung bereits gesendet wurde
      const notificationExists = await NotificationLog.exists({
        appointmentId: appointment._id,
      });
      if (notificationExists) continue;

      // Abonnements des Users abrufen
      const subscriptions = await Subscription.find({
        userId: appointment.userId,
      });
      if (subscriptions.length === 0) continue;

      // Benachrichtigungsinhalt erstellen
      const notificationPayload = JSON.stringify({
        title: "Medikamentenerinnerung",
        body: `Es ist Zeit für die Medikamente für ${appointment.userName} (${appointment.time} Uhr)`,
        link: "/",
      });

      // Benachrichtigungen an alle Abonnements senden
      const results = await Promise.allSettled(
        subscriptions.map(async (subscription) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.keys.p256dh,
                  auth: subscription.keys.auth,
                },
              },
              notificationPayload
            );
            return { success: true };
          } catch (error: any) {
            console.error("Fehler beim Senden:", error);

            // Ungültige Subscriptions entfernen
            if (error.statusCode === 404 || error.statusCode === 410) {
              await Subscription.findByIdAndDelete(subscription._id);
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

      // Ergebnisse auswerten
      const successful = results.filter(
        (r) => r.status === "fulfilled" && r.value.success
      ).length;
      const failed = results.filter(
        (r) => r.status === "rejected" || !r.value.success
      ).length;
      const removed = results.filter(
        (r) => r.status === "fulfilled" && r.value.removed
      ).length;

      totalSent += successful;
      totalFailed += failed;
      totalRemoved += removed;

      // Bei erfolgreichen Benachrichtigungen Log-Eintrag erstellen
      if (successful > 0) {
        await NotificationLog.create({
          appointmentId: appointment._id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalAppointments: appointments.length,
        notificationsSent: totalSent,
        notificationsFailed: totalFailed,
        subscriptionsRemoved: totalRemoved,
      },
      message: `Verarbeitung abgeschlossen. ${totalSent} Benachrichtigungen gesendet.`,
    });
  } catch (error) {
    console.error("Fehler in der API-Route:", error);
    return res.status(500).json({
      error: "Interner Serverfehler",
      details: error instanceof Error ? error.message : "Unbekannter Fehler",
    });
  }
}

// Hilfsfunktion zur Zeitfensterüberprüfung
function isWithinTimeWindow(
  appointmentTime: string,
  currentTime: Date
): boolean {
  const [hours, minutes] = appointmentTime.split(":").map(Number);
  const appointmentTotalMinutes = hours * 60 + minutes;

  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  const diff = currentTotalMinutes - appointmentTotalMinutes;

  // 30 Minuten vor und nach dem Termin
  return diff >= -30 && diff <= 30;
}
