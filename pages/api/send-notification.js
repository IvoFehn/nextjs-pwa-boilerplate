// pages/api/send-notification.js
import webpush from "web-push";
import { getSubscriptionsFromDB } from "your-database"; // Beispiel-Funktion

webpush.setVapidDetails(
  "mailto:deine@email.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  const subscriptions = await getSubscriptionsFromDB(); // Hole gespeicherte Abonnements
  const payload = JSON.stringify({
    title: "Hallo!",
    body: "Nachricht von Next.js",
  });

  subscriptions.forEach((sub) => {
    webpush.sendNotification(sub, payload).catch((error) => {
      console.error("Fehler beim Senden:", error);
    });
  });

  res.status(200).json({ sent: true });
}
