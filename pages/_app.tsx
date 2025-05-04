import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import Head from "next/head";

// TypeScript-Definition für die globale logToScreen-Funktion
declare global {
  var logToScreen: undefined | ((message: string) => void);
  interface Window {
    logToScreen?: (message: string) => void;
  }
}

// VAPID Public Key aus Umgebungsvariablen
const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

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

// TypeScript-Interface für Service Worker Registration
interface ServiceWorkerRegistrationWithWaiting
  extends ServiceWorkerRegistration {
  waiting: ServiceWorker | null;
  installing: ServiceWorker | null;
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Service Worker und Push-Benachrichtigungen registrieren
    async function registerServiceWorkerAndPush() {
      if ("serviceWorker" in navigator) {
        try {
          // Zuerst prüfen, ob bereits eine Registrierung existiert
          const existingRegistration =
            (await navigator.serviceWorker.getRegistration()) as ServiceWorkerRegistrationWithWaiting;
          if (existingRegistration) {
            window.logToScreen?.(
              "Bestehender Service Worker gefunden. Status: " +
                (existingRegistration.active ? "Aktiv" : "Inaktiv")
            );

            // Falls der Service Worker inaktiv ist
            if (!existingRegistration.active && existingRegistration.waiting) {
              window.logToScreen?.(
                "Service Worker wartet auf Aktivierung. Sende SKIP_WAITING."
              );
              existingRegistration.waiting.postMessage({
                type: "SKIP_WAITING",
              });
            }

            // Aktualisieren und neu registrieren
            window.logToScreen?.("Service Worker wird aktualisiert");
            existingRegistration.update();
          }

          // Service Worker registrieren oder erneut registrieren
          const registration = (await navigator.serviceWorker.register(
            "/sw.js",
            {
              updateViaCache: "none", // Immer frischen SW vom Server holen
            }
          )) as ServiceWorkerRegistrationWithWaiting;

          window.logToScreen?.(
            "Service Worker registriert mit Scope: " + registration.scope
          );

          // Auf "controlling" Event warten
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            window.logToScreen?.("Service Worker hat die Kontrolle übernommen");
          });

          // Auf Status-Updates reagieren
          const trackInstallation = (
            reg: ServiceWorkerRegistrationWithWaiting
          ) => {
            if (reg.installing) {
              const sw = reg.installing;
              sw.addEventListener("statechange", () => {
                window.logToScreen?.(
                  "Service Worker Status geändert: " + sw.state
                );
              });
            }
          };

          trackInstallation(registration);

          // Force Activate, falls nötig
          if (registration.waiting) {
            window.logToScreen?.(
              "Service Worker wartet auf Aktivierung. Sende SKIP_WAITING."
            );
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          // Benachrichtigungsberechtigung überprüfen
          if ("Notification" in window) {
            // Aktuellen Berechtigungsstatus prüfen und anzeigen
            let permission = Notification.permission;
            window.logToScreen?.(
              "Aktuelle Notification Berechtigung: " + permission
            );

            // Auf iOS prüfen und speziellen Hinweis anzeigen
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIOS && permission === "denied") {
              window.logToScreen?.(
                "Benachrichtigungen sind in Safari blockiert. Bitte gehen Sie zu Einstellungen > Safari > Erweitert > Websiteeinstellungen und erlauben Sie Benachrichtigungen für diese Website."
              );

              // UI-Hinweis anzeigen
              const notificationAlert = document.createElement("div");
              notificationAlert.style.position = "fixed";
              notificationAlert.style.top = "0";
              notificationAlert.style.left = "0";
              notificationAlert.style.right = "0";
              notificationAlert.style.padding = "10px";
              notificationAlert.style.background = "#f8d7da";
              notificationAlert.style.color = "#721c24";
              notificationAlert.style.textAlign = "center";
              notificationAlert.style.zIndex = "10000";
              notificationAlert.innerHTML =
                "Benachrichtigungen sind blockiert. Bitte gehen Sie zu <strong>Einstellungen > Safari > Erweitert > Websiteeinstellungen</strong>, um Benachrichtigungen zu erlauben.";
              document.body.appendChild(notificationAlert);
            }

            // Bei default-Status nach Berechtigung fragen
            if (permission === "default") {
              try {
                // Berechtigung explizit anfordern
                permission = await Notification.requestPermission();
                window.logToScreen?.(
                  "Notification Berechtigung nach Anfrage: " + permission
                );
              } catch (permError) {
                const error = permError as Error;
                window.logToScreen?.(
                  "Fehler beim Anfordern der Berechtigung: " + error.message
                );
              }
            }

            // Wenn Berechtigung erteilt wurde, mit Push fortfahren
            if (permission === "granted") {
              // Prüfen, ob der Service Worker bereit ist
              if (!registration.active) {
                window.logToScreen?.("Warte auf aktiven Service Worker...");

                // Warten bis der Service Worker aktiviert ist
                await new Promise<void>((resolve) => {
                  const checkActive = () => {
                    if (registration.active) {
                      resolve();
                    } else {
                      setTimeout(checkActive, 100);
                    }
                  };
                  checkActive();
                });

                window.logToScreen?.("Service Worker ist jetzt aktiv");
              }

              try {
                // Prüfen, ob bereits ein Push-Abonnement existiert
                let subscription =
                  await registration.pushManager.getSubscription();

                window.logToScreen?.(
                  "Bestehende Subscription: " + (subscription ? "Ja" : "Nein")
                );

                // Falls kein Abonnement besteht, eines erstellen
                if (!subscription) {
                  const vapidPublicKey =
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

                  if (!vapidPublicKey) {
                    window.logToScreen?.(
                      "FEHLER: VAPID Public Key fehlt in den Umgebungsvariablen"
                    );
                    return;
                  }

                  window.logToScreen?.("Erstelle neue Push-Subscription");

                  // Zuerst altes Abonnement beenden, falls eins existiert
                  const existingSubscription =
                    await registration.pushManager.getSubscription();
                  if (existingSubscription) {
                    await existingSubscription.unsubscribe();
                    window.logToScreen?.("Altes Abonnement beendet");
                  }

                  // Neues Abonnement erstellen
                  try {
                    subscription = await registration.pushManager.subscribe({
                      userVisibleOnly: true, // Erforderlich für iOS
                      applicationServerKey:
                        urlBase64ToUint8Array(vapidPublicKey),
                    });
                    window.logToScreen?.("Neue Push-Subscription erstellt");
                  } catch (subscribeError) {
                    const error = subscribeError as Error;
                    window.logToScreen?.(
                      "Fehler beim Erstellen der Push-Subscription: " +
                        error.message
                    );

                    if (isIOS) {
                      window.logToScreen?.(
                        "Auf iOS: Bitte überprüfen Sie, dass Safari Push-Benachrichtigungen erlaubt und dass Sie die Website zum Homescreen hinzugefügt haben."
                      );
                    }
                    return;
                  }

                  // Abonnement an Server senden
                  try {
                    const response = await fetch("/api/push-subscribe", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(subscription),
                    });

                    if (response.ok) {
                      window.logToScreen?.(
                        "Push-Subscription erfolgreich an Server gesendet"
                      );
                    } else {
                      window.logToScreen?.(
                        "Fehler beim Senden der Push-Subscription an Server: " +
                          response.statusText
                      );
                    }
                  } catch (fetchError) {
                    const error = fetchError as Error;
                    window.logToScreen?.(
                      "Netzwerkfehler beim Senden der Push-Subscription: " +
                        error.message
                    );
                  }
                } else {
                  window.logToScreen?.(
                    "Bestehende Push-Subscription wird verwendet"
                  );
                }

                window.logToScreen?.(
                  "Push-Benachrichtigungen erfolgreich aktiviert"
                );
              } catch (error) {
                const subscriptionError = error as Error;
                window.logToScreen?.(
                  "Fehler bei der Push-Subscription: " +
                    subscriptionError.message
                );
                console.error("Push-Subscription Fehler:", subscriptionError);
              }
            } else {
              window.logToScreen?.(
                "Notification-Berechtigung wurde verweigert oder nicht erteilt: " +
                  permission
              );

              // Information für den Benutzer
              if (isIOS) {
                window.logToScreen?.(
                  "Um Benachrichtigungen auf iOS zu aktivieren, gehen Sie zu Einstellungen > Safari > Erweitert > Websiteeinstellungen und erlauben Sie Benachrichtigungen für diese Website."
                );
              } else {
                window.logToScreen?.(
                  "Um Benachrichtigungen zu aktivieren, erlauben Sie diese in Ihren Browser-Einstellungen für diese Website."
                );
              }
            }
          } else {
            (window as any).logToScreen?.(
              "Notification API wird nicht unterstützt"
            );
          }
        } catch (error) {
          const registrationError = error as Error;
          window.logToScreen?.(
            "Fehler bei der Service Worker Registrierung: " +
              registrationError.message
          );
          console.error(
            "Service Worker Registrierungsfehler:",
            registrationError
          );
        }
      } else {
        window.logToScreen?.(
          "Service Worker wird von diesem Browser nicht unterstützt"
        );
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
