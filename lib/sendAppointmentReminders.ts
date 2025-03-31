// lib/sendAppointmentReminders.ts
import webpush from "web-push";
import dbConnect from "./dbConnect";
import { Appointment } from "@/types/apointment";

// VAPID-Details konfigurieren (gleiche wie in der API)
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

// Funktion zum Versenden von Terminerinnerungen
export async function sendAppointmentReminders() {
  try {
    console.log("[Cron] Starte Versand von Terminerinnerungen...");

    // Verbindung zur Datenbank herstellen
    const { db } = await dbConnect();
    const settingsCollection = db.collection("settings");
    const appointmentsCollection = db.collection("appointments");
    const subscriptionsCollection = db.collection("push_subscriptions");

    // Einstellungen laden
    const settings = await settingsCollection.findOne({ type: "cat_spray" });

    if (
      !settings ||
      !settings.scheduledTimes ||
      settings.scheduledTimes.length === 0
    ) {
      console.log("[Cron] Keine geplanten Termine gefunden.");
      return { success: false, message: "Keine geplanten Termine gefunden." };
    }

    // Aktuelle Zeit
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Heutiges Datum (YYYY-MM-DD)
    const today = now.toISOString().split("T")[0];

    // Bereits erledigte Termine für heute laden
    const completedAppointments = (await appointmentsCollection
      .find({
        date: today,
      })
      .toArray()) as Appointment[];

    // Alle Push-Abonnements laden
    const subscriptions = await subscriptionsCollection.find({}).toArray();

    if (subscriptions.length === 0) {
      console.log("[Cron] Keine Push-Abonnements gefunden.");
      return { success: false, message: "Keine Push-Abonnements gefunden." };
    }

    // Ergebniszähler
    let sentCount = 0;
    let failedCount = 0;
    let removedCount = 0;
    let skippedCount = 0;
    const sentDetails = [];

    // Jeden geplanten Termin prüfen
    for (const scheduledTime of settings.scheduledTimes) {
      // Zeit parsen (Format: "HH:MM")
      const [hours, minutes] = scheduledTime.split(":").map(Number);

      // Prüfen, ob der Termin dem aktuellen Zeitfenster entspricht
      // Wir prüfen, ob die aktuelle Zeit innerhalb einer 5-Minuten-Zeitspanne vor dem Termin liegt
      const isTimeToSend =
        (currentHour === hours &&
          currentMinute >= minutes - 5 &&
          currentMinute < minutes) ||
        // Oder für Termine kurz nach Mitternacht
        (hours === 0 && currentHour === 23 && currentMinute >= 55);

      if (isTimeToSend) {
        // Prüfen, ob der Termin bereits erledigt wurde
        const isCompleted = completedAppointments.some(
          (app: Appointment) => app.time === scheduledTime
        );

        if (isCompleted) {
          console.log(
            `[Cron] Termin ${scheduledTime} Uhr wurde bereits erledigt. Überspringe.`
          );
          skippedCount++;
          continue;
        }

        console.log(`[Cron] Sende Erinnerung für ${scheduledTime} Uhr`);

        // Benachrichtigungsinhalt
        const notificationPayload = JSON.stringify({
          title: "Katzen-Spray Erinnerung",
          body: `Es ist fast Zeit für die ${scheduledTime} Uhr Anwendung des Katzen-Sprays.`,
          link: "/", // Link zur Hauptseite
        });

        // Benachrichtigungen an alle Abonnements senden
        const sendPromises = subscriptions.map(async (subscription: any) => {
          try {
            await webpush.sendNotification(subscription, notificationPayload);
            return { success: true, endpoint: subscription.endpoint };
          } catch (error: any) {
            console.error(
              `[Cron] Fehler beim Senden an ${subscription.endpoint}:`,
              error.message
            );

            // Bei ungültigem Abonnement aus der Datenbank entfernen
            if (error.statusCode === 404 || error.statusCode === 410) {
              await subscriptionsCollection.deleteOne({
                endpoint: subscription.endpoint,
              });
              console.log(
                `[Cron] Ungültiges Abonnement entfernt: ${subscription.endpoint}`
              );
              return {
                success: false,
                removed: true,
                endpoint: subscription.endpoint,
              };
            }

            return {
              success: false,
              endpoint: subscription.endpoint,
              error: error.message,
            };
          }
        });

        // Warten, bis alle Benachrichtigungen gesendet wurden
        const results = await Promise.allSettled(sendPromises);

        // Ergebnisse auswerten
        const successful = results.filter(
          (r) => r.status === "fulfilled" && (r.value as any).success
        ).length;

        const failed = results.filter(
          (r) =>
            r.status === "rejected" ||
            (r.status === "fulfilled" && !(r.value as any).success)
        ).length;

        const removed = results.filter(
          (r) => r.status === "fulfilled" && (r.value as any).removed
        ).length;

        sentCount += successful;
        failedCount += failed;
        removedCount += removed;

        sentDetails.push({
          time: scheduledTime,
          successful,
          failed,
          removed,
        });

        console.log(
          `[Cron] ${successful} Benachrichtigungen gesendet für ${scheduledTime} Uhr`
        );
      }
    }

    // Gesamtergebnis
    return {
      success: true,
      sent: sentCount,
      failed: failedCount,
      removed: removedCount,
      skipped: skippedCount,
      details: sentDetails,
    };
  } catch (error) {
    console.error("[Cron] Fehler beim Senden der Erinnerungen:", error);
    return {
      success: false,
      error: (error as Error).message || "Unbekannter Fehler",
    };
  }
}

// Export einer Hilfsfunktion zum direkten Senden von Erinnerungen für einen bestimmten Termin
export async function sendReminderForTime(time: string) {
  try {
    // Verbindung zur Datenbank herstellen
    const { db } = await dbConnect();
    const appointmentsCollection = db.collection("appointments");
    const subscriptionsCollection = db.collection("push_subscriptions");

    // Heutiges Datum (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // Prüfen, ob der Termin bereits erledigt wurde
    const isCompleted = await appointmentsCollection.findOne({
      date: today,
      time: time,
    });

    if (isCompleted) {
      console.log(
        `[API] Termin ${time} Uhr wurde bereits erledigt. Keine Benachrichtigung gesendet.`
      );
      return {
        success: true,
        message: `Termin ${time} Uhr wurde bereits erledigt. Keine Benachrichtigung gesendet.`,
        completed: true,
      };
    }

    // Alle Abonnements laden
    const subscriptions = await subscriptionsCollection.find({}).toArray();

    if (subscriptions.length === 0) {
      console.log("[API] Keine Push-Abonnements gefunden.");
      return { success: false, message: "Keine Push-Abonnements gefunden." };
    }

    // Benachrichtigungsinhalt
    const notificationPayload = JSON.stringify({
      title: "Katzen-Spray Erinnerung",
      body: `Es ist Zeit für die ${time} Uhr Anwendung des Katzen-Sprays.`,
      link: "/", // Link zur Hauptseite
    });

    // Benachrichtigungen an alle Abonnements senden
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription: any) => {
        try {
          await webpush.sendNotification(subscription, notificationPayload);
          return { success: true };
        } catch (error: any) {
          console.error(
            "[API] Fehler beim Senden der Benachrichtigung:",
            error
          );

          // Bei ungültigem Abonnement aus der Datenbank entfernen
          if (error.statusCode === 404 || error.statusCode === 410) {
            await subscriptionsCollection.deleteOne({
              endpoint: subscription.endpoint,
            });
            return { success: false, removed: true };
          }

          return { success: false, error: error.message };
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

    return {
      success: true,
      sent,
      failed,
      removed,
      total: subscriptions.length,
      time,
    };
  } catch (error) {
    console.error("[API] Fehler beim Senden der Erinnerung:", error);
    return {
      success: false,
      error: (error as Error).message || "Unbekannter Fehler",
    };
  }
}
