// components/PushNotificationToggle.tsx
import React, { useState } from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import {
  Bell,
  BellOff,
  AlertTriangle,
  Check,
  Info,
  RefreshCw,
} from "lucide-react";

interface PushNotificationToggleProps {
  userId?: string;
  style?: React.CSSProperties;
  messageText?: {
    enabledMessage?: string;
    disabledMessage?: string;
  };
}

const PushNotificationToggle: React.FC<PushNotificationToggleProps> = ({
  userId,
  style,
  messageText,
}) => {
  const {
    isSupported,
    isSubscribed,
    permissionState,
    error,
    platform,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Stil für die Komponente (kann mit den übergebenen Stilen überschrieben werden)
  const defaultStyles = {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px",
      padding: "16px",
      borderRadius: "12px",
      backgroundColor: "#f9fafb",
      border: "1px solid #e5e7eb",
      marginBottom: "16px",
      ...style,
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
    },
    title: {
      fontSize: "16px",
      fontWeight: 600,
      margin: 0,
      color: "#111827",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    description: {
      fontSize: "14px",
      color: "#6b7280",
      margin: "0",
      lineHeight: "1.5",
    },
    button: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    subscribeButton: {
      backgroundColor: "#6366f1",
      color: "white",
    },
    unsubscribeButton: {
      backgroundColor: "#f3f4f6",
      color: "#4b5563",
    },
    error: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px",
      borderRadius: "8px",
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      fontSize: "14px",
      marginTop: "8px",
    },
    success: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px",
      borderRadius: "8px",
      backgroundColor: "#d1fae5",
      color: "#047857",
      fontSize: "14px",
      marginTop: "8px",
    },
    info: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px",
      borderRadius: "8px",
      backgroundColor: "#e0f2fe",
      color: "#0369a1",
      fontSize: "14px",
      marginTop: "8px",
    },
    disabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    loading: {
      animation: "spin 1s linear infinite",
    },
  };

  // iOS-spezifische Inhalte
  const isIOS = platform === "ios";
  const isUnsupportedIOS = isIOS && !isSupported;

  // Benutzerdefinierte Nachrichtentexte oder Standardtexte
  const enabledMessage =
    messageText?.enabledMessage ||
    "Sie erhalten Benachrichtigungen, wenn es Zeit für Ihre Medikamente ist.";

  const disabledMessage =
    messageText?.disabledMessage ||
    "Aktivieren Sie Push-Benachrichtigungen, um rechtzeitig an Ihre Medikamente erinnert zu werden.";

  // Wenn der Browser keine Push-Benachrichtigungen unterstützt
  if (!isSupported) {
    return (
      <div style={defaultStyles.container}>
        <div style={defaultStyles.header}>
          <h3 style={defaultStyles.title}>
            <BellOff size={18} />
            Push-Benachrichtigungen
          </h3>
        </div>
        <p style={defaultStyles.description}>
          {isUnsupportedIOS
            ? "Ihr iOS-Gerät unterstützt keine Push-Benachrichtigungen. iOS 16.4 oder höher wird benötigt."
            : "Leider unterstützt Ihr Browser keine Push-Benachrichtigungen."}
        </p>
      </div>
    );
  }

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await subscribe(userId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await unsubscribe();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={defaultStyles.container}>
      <div style={defaultStyles.header}>
        <h3 style={defaultStyles.title}>
          <Bell size={18} color={isSubscribed ? "#6366f1" : undefined} />
          Push-Benachrichtigungen
        </h3>

        {isSubscribed ? (
          <button
            style={{
              ...defaultStyles.button,
              ...defaultStyles.unsubscribeButton,
              ...(isLoading ? defaultStyles.disabled : {}),
            }}
            onClick={handleUnsubscribe}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <BellOff size={16} />
            )}
            Deaktivieren
          </button>
        ) : (
          <button
            style={{
              ...defaultStyles.button,
              ...defaultStyles.subscribeButton,
              ...(permissionState === "denied" || isLoading
                ? defaultStyles.disabled
                : {}),
            }}
            onClick={handleSubscribe}
            disabled={permissionState === "denied" || isLoading}
          >
            {isLoading ? (
              <RefreshCw
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Bell size={16} />
            )}
            Aktivieren
          </button>
        )}
      </div>

      <p style={defaultStyles.description}>
        {isSubscribed ? enabledMessage : disabledMessage}
      </p>

      {error && (
        <div style={defaultStyles.error}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {isSubscribed && !error && (
        <div style={defaultStyles.success}>
          <Check size={16} />
          <span>Benachrichtigungen sind aktiviert</span>
        </div>
      )}

      {permissionState === "denied" && (
        <div style={defaultStyles.error}>
          <AlertTriangle size={16} />
          <span>
            Benachrichtigungen wurden in Ihrem Browser blockiert. Bitte ändern
            Sie die Einstellungen in Ihrem Browser, um Benachrichtigungen zu
            erlauben.
          </span>
        </div>
      )}

      {isIOS &&
        isSupported &&
        permissionState !== "denied" &&
        !isSubscribed && (
          <div style={defaultStyles.info}>
            <Info size={16} />
            <span>
              Hinweis für iOS-Nutzer: Nach dem Aktivieren müssen Sie
              möglicherweise die Einstellungen in Safari öffnen und die
              Benachrichtigungen für diese Website ausdrücklich erlauben.
            </span>
          </div>
        )}
    </div>
  );
};

export default PushNotificationToggle;
