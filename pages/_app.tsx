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
            const permission = await Notification.requestPermission();
            window.logToScreen?.("Notification Berechtigung: " + permission);

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
                  subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true, // Erforderlich für iOS
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                  });

                  window.logToScreen?.("Neue Push-Subscription erstellt");

                  // Abonnement an Server senden
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
            }
          } else {
            (window as any).logToScreen(
              "Service Worker Aktivierung angefordert"
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

    // Debug-Logger vor Service Worker registrieren
    setupDebugLogger();
    registerServiceWorkerAndPush();
  }, []); // Leeres Array, damit useEffect nur einmal beim Mount ausgeführt wird

  // Diese Funktion enthält die Debug-Logger-Logik
  function setupDebugLogger() {
    // Debugger-Element erstellen
    const createDebugger = (): void => {
      const existingDebugger = document.getElementById("debug-log");
      if (existingDebugger) return;

      const debugElement = document.createElement("div");
      debugElement.id = "debug-log";
      debugElement.style.position = "fixed";
      debugElement.style.bottom = "0";
      debugElement.style.left = "0";
      debugElement.style.right = "0";
      debugElement.style.backgroundColor = "rgba(0,0,0,0.7)";
      debugElement.style.color = "white";
      debugElement.style.padding = "10px";
      debugElement.style.zIndex = "9999";
      debugElement.style.maxHeight = "30vh";
      debugElement.style.overflow = "auto";
      debugElement.style.fontSize = "12px";

      // Toggle-Button hinzufügen
      const toggleButton = document.createElement("button");
      toggleButton.textContent = "Debug Log ausblenden";
      toggleButton.style.padding = "5px";
      toggleButton.style.marginBottom = "5px";
      toggleButton.style.background = "#555";
      toggleButton.style.color = "white";
      toggleButton.style.border = "none";
      toggleButton.style.borderRadius = "4px";

      toggleButton.addEventListener("click", () => {
        const content = document.getElementById("debug-content");
        if (content) {
          const isHidden = content.style.display === "none";
          content.style.display = isHidden ? "block" : "none";
          toggleButton.textContent = isHidden
            ? "Debug Log ausblenden"
            : "Debug Log anzeigen";
        }
      });

      const contentDiv = document.createElement("div");
      contentDiv.id = "debug-content";

      // Aktivierungs-Button hinzufügen
      const activateButton = document.createElement("button");
      activateButton.textContent = "Service Worker aktivieren";
      activateButton.style.padding = "5px";
      activateButton.style.marginLeft = "10px";
      activateButton.style.background = "#4CAF50";
      activateButton.style.color = "white";
      activateButton.style.border = "none";
      activateButton.style.borderRadius = "4px";

      activateButton.addEventListener("click", async () => {
        if ("serviceWorker" in navigator) {
          const registration =
            (await navigator.serviceWorker.getRegistration()) as ServiceWorkerRegistrationWithWaiting;
          if (registration) {
            if (registration.waiting) {
              registration.waiting.postMessage({ type: "SKIP_WAITING" });
              window.logToScreen?.("Service Worker Aktivierung angefordert");
            } else if (registration.installing) {
              window.logToScreen?.(
                "Service Worker wird installiert, bitte warten"
              );
            } else if (registration.active) {
              window.logToScreen?.("Service Worker ist bereits aktiv");
              // Trotzdem aktualisieren
              registration.update();
            }
          } else {
            window.logToScreen?.("Kein Service Worker registriert");
          }
        }
      });

      debugElement.appendChild(toggleButton);
      debugElement.appendChild(activateButton);
      debugElement.appendChild(contentDiv);
      document.body.appendChild(debugElement);
    };

    // Funktion zum Loggen mit korrekter TypeScript-Typisierung
    function logToScreen(message: string): void {
      createDebugger();

      const logContent = document.getElementById("debug-content");
      if (!logContent) return;

      const logItem = document.createElement("div");
      logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      logContent.appendChild(logItem);

      // Scroll to bottom
      logContent.scrollTop = logContent.scrollHeight;
    }

    // Globale Funktion für alle Komponenten zugänglich machen
    window.logToScreen = logToScreen;

    // Nachrichten vom Service Worker empfangen
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "message",
        (event: MessageEvent) => {
          if (event.data?.type === "DEBUG_LOG") {
            logToScreen(event.data.message);
          }
        }
      );
    }

    // Initiallog
    logToScreen("App gestartet");

    // Geräteinformationen loggen
    logToScreen(`User Agent: ${navigator.userAgent}`);

    // iOS-Version erkennen und loggen
    const iosVersion = (): string | null => {
      const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
      return match
        ? `${match[1]}.${match[2]}${match[3] ? `.${match[3]}` : ""}`
        : null;
    };

    if (
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream
    ) {
      const version = iosVersion();
      logToScreen(`iOS-Gerät erkannt. Version: ${version || "Unbekannt"}`);
    } else {
      logToScreen(`Kein iOS-Gerät erkannt`);
    }

    // Service Worker Status loggen
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          logToScreen(`Service Worker registriert: ${registration.scope}`);
          logToScreen(
            `Service Worker Status: ${
              registration.active ? "Aktiv" : "Inaktiv"
            }`
          );
        } else {
          logToScreen("Kein Service Worker registriert");
        }
      });
    } else {
      logToScreen("Service Worker nicht unterstützt");
    }

    // Push API unterstützt?
    logToScreen(`Push API unterstützt: ${"PushManager" in window}`);

    // Notification API unterstützt?
    logToScreen(`Notification API unterstützt: ${"Notification" in window}`);

    // Aktueller Notification-Berechtigungsstatus
    if ("Notification" in window) {
      logToScreen(`Notification Berechtigung: ${Notification.permission}`);
    }

    // VAPID Key prüfen
    logToScreen(`VAPID Key vorhanden: ${!!PUBLIC_VAPID_KEY}`);
    if (PUBLIC_VAPID_KEY) {
      logToScreen(`VAPID Key Länge: ${PUBLIC_VAPID_KEY.length}`);
    }
  }

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
