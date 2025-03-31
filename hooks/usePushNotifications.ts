// hooks/usePushNotifications.ts
import { useState, useEffect } from "react";

// Definiere Interfaces für unsere Daten
interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  permissionState: NotificationPermission;
  error: string | null;
  platform: string | null;
}

// VAPID Public Key von unserem Server
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

// Hilfsfunktion zur Umwandlung des VAPID Keys in ein ArrayBuffer
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Plattform erkennen
function detectPlatform(): string {
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera || "";

  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return "ios";
  }

  if (/android/i.test(userAgent)) {
    return "android";
  }

  if (/Windows/.test(userAgent)) {
    return "windows";
  }

  if (/Mac/.test(userAgent)) {
    return "mac";
  }

  return "other";
}

// iOS-Version erkennen
function getIOSVersion(): number | null {
  const userAgent = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

// Hook für Web Push Notifications
export function usePushNotifications() {
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    permissionState: "default",
    error: null,
    platform: null,
  });

  // Prüfe bei Initialisierung, ob Push-Notifications unterstützt werden
  useEffect(() => {
    const checkSupport = async () => {
      // Plattform erkennen
      const platform = detectPlatform();

      // Prüfen ob Browser Push-Notifications unterstützt
      const isPushSupported =
        "serviceWorker" in navigator && "PushManager" in window;

      // Spezieller iOS-Check: Web Push ab iOS 16.4+ unterstützt
      let isSupported = isPushSupported;

      if (platform === "ios") {
        const iosVersion = getIOSVersion();
        // iOS unterstützt Web Push erst ab Version 16.4
        if (iosVersion !== null && iosVersion < 16) {
          isSupported = false;
        }
      }

      if (!isSupported) {
        setState((prevState) => ({
          ...prevState,
          isSupported,
          platform,
          error:
            "Dieser Browser unterstützt keine Push-Benachrichtigungen." +
            (platform === "ios"
              ? " iOS benötigt Version 16.4 oder höher."
              : ""),
        }));
        return;
      }

      try {
        // Aktuellen Berechtigungsstatus abrufen
        const permissionState = window.Notification
          ?.permission as NotificationPermission;

        // Service Worker registrieren falls noch nicht geschehen
        if (!navigator.serviceWorker.controller) {
          try {
            await navigator.serviceWorker.register("/sw.js");
          } catch (err) {
            console.error("Service Worker Registrierungsfehler:", err);
          }
        }

        // Prüfen, ob der Service Worker bereit ist
        const registration = await navigator.serviceWorker.ready;

        // Prüfen, ob bereits ein Abonnement besteht
        const subscription = await registration.pushManager.getSubscription();

        setState({
          isSupported,
          isSubscribed: !!subscription,
          subscription: subscription as unknown as PushSubscription,
          permissionState,
          error: null,
          platform,
        });
      } catch (error) {
        setState((prevState) => ({
          ...prevState,
          isSupported,
          platform,
          error:
            "Fehler beim Initialisieren der Push-Benachrichtigungen: " +
            (error as Error).message,
        }));
      }
    };

    checkSupport();
  }, []);

  // Funktion zum Abonnieren von Push-Benachrichtigungen
  const subscribe = async (userId?: string) => {
    try {
      if (!state.isSupported) {
        throw new Error("Push-Benachrichtigungen werden nicht unterstützt.");
      }

      // Berechtigungen anfordern, falls noch nicht geschehen
      if (state.permissionState !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          throw new Error("Benachrichtigungsberechtigung verweigert.");
        }
      }

      // Service Worker registrieren falls noch nicht geschehen
      if (!navigator.serviceWorker.controller) {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch (err) {
          console.error("Service Worker Registrierungsfehler:", err);
        }
      }

      // Service Worker abrufen
      const registration = await navigator.serviceWorker.ready;

      // Falls ein altes Abonnement existiert, dieses zuerst beenden
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      // Neues Abonnement erstellen
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Erforderlich für iOS
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Abonnementdaten vorbereiten
      const subscriptionData = {
        ...subscription.toJSON(),
        userId: userId || null,
        platform: state.platform,
      };

      // Abonnement an den Server senden
      const response = await fetch("/api/push-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error(
          "Fehler beim Speichern des Abonnements auf dem Server."
        );
      }

      // State aktualisieren
      setState((prevState) => ({
        ...prevState,
        isSubscribed: true,
        subscription: subscription as unknown as PushSubscription,
        permissionState: "granted",
        error: null,
      }));

      return true;
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        error: (error as Error).message,
      }));
      return false;
    }
  };

  // Funktion zum Abmelden von Push-Benachrichtigungen
  const unsubscribe = async () => {
    try {
      if (!state.subscription) {
        throw new Error("Kein aktives Abonnement gefunden.");
      }

      // Abonnement vom Server entfernen
      const response = await fetch("/api/push-subscription", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint: state.subscription.endpoint }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Entfernen des Abonnements vom Server.");
      }

      // Lokales Abonnement beenden
      const pushSubscription = state.subscription as unknown as {
        unsubscribe: () => Promise<boolean>;
      };
      await pushSubscription.unsubscribe();

      // State aktualisieren
      setState((prevState) => ({
        ...prevState,
        isSubscribed: false,
        subscription: null,
        error: null,
      }));

      return true;
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        error: (error as Error).message,
      }));
      return false;
    }
  };

  return {
    ...state,
    subscribe,
    unsubscribe,
  };
}
