import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import Head from "next/head";

// VAPID Public Key aus Umgebungsvariablen
const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || "";

// Hilfsfunktion zur Konvertierung des VAPID-Schlüssels
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Service Worker und Push-Benachrichtigungen registrieren
    async function registerServiceWorkerAndPush() {
      if ("serviceWorker" in navigator) {
        try {
          // Service Worker registrieren
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log(
            "Service Worker registriert mit Scope:",
            registration.scope
          );

          // Benachrichtigungsberechtigung überprüfen
          if ("Notification" in window) {
            const permission = await Notification.requestPermission();

            if (permission === "granted") {
              // Prüfen, ob bereits ein Push-Abonnement existiert
              let subscription =
                await registration.pushManager.getSubscription();

              // Falls kein Abonnement besteht, eines erstellen
              if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true, // Erforderlich für iOS
                  applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
                });

                // Abonnement an Server senden
                await fetch("/api/push-subscribe", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(subscription),
                });
              }

              console.log("Push-Benachrichtigungen erfolgreich aktiviert");
            }
          }
        } catch (error) {
          console.error(
            "Fehler bei der Registrierung des Service Workers oder Push:",
            error
          );
        }
      }
    }

    registerServiceWorkerAndPush();
  }, []); // Leeres Array, damit useEffect nur einmal beim Mount ausgeführt wird

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MedPlanner" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
