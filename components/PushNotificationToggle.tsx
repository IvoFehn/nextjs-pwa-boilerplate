// components/PushNotificationToggle.tsx
import React from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { Bell, BellOff, AlertTriangle, Check } from "lucide-react";

interface PushNotificationToggleProps {
  userId?: string;
  style?: React.CSSProperties;
}

const PushNotificationToggle: React.FC<PushNotificationToggleProps> = ({
  userId,
  style,
}) => {
  const {
    isSupported,
    isSubscribed,
    permissionState,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

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
    disabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  };

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
          Leider unterstützt Ihr Browser keine Push-Benachrichtigungen.
        </p>
      </div>
    );
  }

  const handleSubscribe = async () => {
    await subscribe();
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
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
            }}
            onClick={handleUnsubscribe}
          >
            <BellOff size={16} />
            Deaktivieren
          </button>
        ) : (
          <button
            style={{
              ...defaultStyles.button,
              ...defaultStyles.subscribeButton,
            }}
            onClick={handleSubscribe}
            disabled={permissionState === "denied"}
          >
            <Bell size={16} />
            Aktivieren
          </button>
        )}
      </div>

      <p style={defaultStyles.description}>
        {isSubscribed
          ? "Sie erhalten Benachrichtigungen, wenn es Zeit für das Katzen-Spray ist."
          : "Aktivieren Sie Push-Benachrichtigungen, um rechtzeitig an die Spray-Termine erinnert zu werden."}
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
    </div>
  );
};

export default PushNotificationToggle;
