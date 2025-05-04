import React, { useState, useEffect, FC } from "react";
import {
  Lock,
  Unlock,
  Settings,
  Check,
  Plus,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  Droplet,
  UserPlus,
  LogOut,
} from "lucide-react";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import Cookies from "js-cookie";
import UserManagement from "@/components/UserManagement";

// Interfaces
interface UserData {
  id: string;
  username: string;
}

interface SprayLogData {
  userId: string;
  userName: string;
  timestamp: string;
}

interface AppointmentData {
  userId: string;
  userName: string;
  time: string;
  date: string;
  timestamp: string;
  _id?: string;
}

interface SettingsData {
  dailyFrequency: number;
  scheduledTimes: string[];
}

// Modernes Design mit CSS-in-JS
const styles = {
  container: {
    maxWidth: "900px",
    width: "100%",
    margin: "0 auto",
    padding: "24px 12px 32px 12px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    color: "#1f2937",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    boxSizing: "border-box" as const,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    width: "100%",
    alignItems: "stretch",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    padding: "20px 28px",
    backgroundColor: "white",
    borderRadius: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoIcon: {
    color: "#6366f1",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    margin: "0",
    color: "#111827",
    letterSpacing: "-0.5px",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    textDecoration: "none",
    minWidth: "120px",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start",
  },
  cardHeader: {
    padding: "18px 24px 12px 24px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  cardIcon: {
    color: "#6366f1",
  },
  cardTitle: {
    fontSize: "17px",
    fontWeight: "600",
    margin: "0",
    color: "#111827",
  },
  cardContent: {
    padding: "24px 24px 20px 24px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    flex: 1,
    minHeight: "120px",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    borderRadius: "8px",
    color: "#6b7280",
    transition: "background-color 0.2s, color 0.2s",
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "14px 0",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    minWidth: "160px",
  },
  disabled: {
    opacity: "0.6",
    cursor: "not-allowed",
  },
  text: {
    margin: "6px 0",
    fontSize: "15px",
    color: "#4b5563",
  },
  strong: {
    fontWeight: "600",
    color: "#111827",
  },
  countDisplay: {
    fontSize: "32px",
    fontWeight: "700",
    textAlign: "center" as const,
    color: "#6366f1",
    margin: "0",
  },
  todayDate: {
    fontSize: "15px",
    color: "#6b7280",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  backdrop: {
    position: "fixed" as const,
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "1000",
    padding: "16px",
    boxSizing: "border-box" as const,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "14px",
    maxWidth: "500px",
    width: "95%",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    boxShadow:
      "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    margin: "20px",
  },
  modalHeader: {
    padding: "24px 24px 16px",
    borderBottom: "1px solid #f3f4f6",
    position: "sticky" as const,
    top: 0,
    backgroundColor: "white",
    zIndex: 10,
  },
  modalTitle: {
    fontSize: "clamp(19px, 4vw, 23px)",
    fontWeight: "600",
    margin: "0 0 8px 0",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  modalDescription: {
    fontSize: "clamp(15px, 3vw, 17px)",
    color: "#6b7280",
    margin: "0",
    lineHeight: "1.5",
  },
  modalContent: {
    padding: "24px",
  },
  modalFooter: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "flex-end",
    gap: "14px",
    padding: "16px 24px",
    backgroundColor: "#f9fafb",
    position: "sticky" as const,
    bottom: 0,
    borderTop: "1px solid #f3f4f6",
  },
  modalButton: {
    padding: "12px 0",
    borderRadius: "8px",
    fontSize: "clamp(15px, 3vw, 17px)",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
    minWidth: "110px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  modalCancel: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
  },
  modalConfirm: {
    backgroundColor: "#6366f1",
    color: "white",
  },
  appointmentList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  appointmentCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #f3f4f6",
    transition: "transform 0.2s, box-shadow 0.2s",
    minHeight: "54px",
  },
  appointmentTime: {
    fontWeight: "600",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#111827",
  },
  appointmentStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  appointmentButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    border: "none",
    backgroundColor: "#6366f1",
    color: "white",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    minWidth: "120px",
    justifyContent: "center",
  },
  completedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 10px 4px 8px",
    borderRadius: "6px",
    fontSize: "13px",
    backgroundColor: "#10b981",
    color: "white",
    fontWeight: "500",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    gap: "14px",
  },
  loadingSpinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #f3f4f6",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingSpinnerSmall: {
    width: "20px",
    height: "20px",
    border: "2px solid #f3f4f6",
    borderTop: "2px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "15px",
    color: "#6b7280",
  },
  resetInfoRow: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "center",
    gap: "14px",
    marginTop: "10px",
    marginBottom: "4px",
    flexWrap: "wrap" as const,
  },
  resetInfoBadge: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#374151",
    fontWeight: 500,
    minWidth: "160px",
    maxWidth: "200px",
    justifyContent: "center",
    textAlign: "center" as const,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    flex: 1,
  },
  resetInfoIcon: {
    color: "#6366f1",
    minWidth: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ampulleContent: {
    padding: "18px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "18px",
  },
  ampulleMain: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "8px",
  },
  ampulleDescription: {
    fontSize: "15px",
    color: "#6b7280",
    margin: "0",
  },
  ampulleResetInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(1, 1fr)",
    gap: "14px",
    borderTop: "1px solid #f3f4f6",
    paddingTop: "16px",
  },
  ampulleResetItem: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  ampulleResetItemTop: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  ampulleResetTitle: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
  },
  ampulleResetValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
  },
};

// Definiere die animierten Styles als CSS-Klassen
const createStyleSheet = () => {
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .hover-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
    }
    .icon-button:hover {
      background-color: #f3f4f6;
      color: #4b5563;
    }
    .primary-button:hover {
      background-color: #4f46e5;
    }
    .appointment-button:hover {
      background-color: #4f46e5;
    }
  `;
  document.head.appendChild(styleEl);
};

const CatSprayTracker: FC = () => {
  useEffect(() => {
    createStyleSheet();
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [lastSprayData, setLastSprayData] = useState<SprayLogData | null>(null);
  const [sprayCount, setSprayCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scheduledTimes, setScheduledTimes] = useState<string[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<
    AppointmentData[]
  >([]);
  const [currentAppointment, setCurrentAppointment] = useState<string | null>(
    null
  );
  const [hoveredAppointment, setHoveredAppointment] = useState<string | null>(
    null
  );
  const [notificationStatus, setNotificationStatus] = useState<string>("");
  const [resetDate, setResetDate] = useState<string | undefined>(undefined);

  // Check for user cookie on mount
  useEffect(() => {
    const userCookie = Cookies.get("catSprayUser");
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        setUserData(user);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    }
  }, []);

  // Load data
  useEffect(() => {
    fetchLastSprayData();
    fetchSprayCount();
    fetchSettings();
    fetchCompletedAppointments();
  }, []);

  const fetchSettings = async (): Promise<void> => {
    try {
      const response = await fetch("/api/cat-spray/settings");
      const data: { settings: SettingsData } = await response.json();
      if (data && data.settings && data.settings.scheduledTimes) {
        setScheduledTimes(data.settings.scheduledTimes);
      } else {
        setScheduledTimes(["08:00", "20:00"]);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Einstellungen:", error);
      setScheduledTimes(["08:00", "20:00"]);
    }
  };

  const fetchCompletedAppointments = async (): Promise<void> => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/cat-spray/appointments?date=${today}`);
      const data: { appointments: AppointmentData[] } = await response.json();
      if (data && data.appointments) {
        setCompletedAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Fehler beim Laden der erledigten Termine:", error);
    }
  };

  const fetchLastSprayData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cat-spray/last");
      const data: SprayLogData = await response.json();
      setLastSprayData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Fehler beim Laden der letzten Spray-Daten:", error);
      setIsLoading(false);
    }
  };

  const fetchSprayCount = async (): Promise<void> => {
    try {
      const response = await fetch("/api/cat-spray/count");
      const data: { count: number; resetDate?: string } = await response.json();
      setSprayCount(data.count);
      setResetDate(data.resetDate);
    } catch (error) {
      console.error("Fehler beim Laden des Spray-Zählers:", error);
    }
  };

  const logSpray = async (): Promise<void> => {
    if (!userData) {
      alert("Bitte melde dich an, um fortzufahren.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch("/api/cat-spray/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          userName: userData.username,
          timestamp: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        // Send notifications after successful logging
        await notifyOthers();

        fetchLastSprayData();
        fetchSprayCount();
        setIsDialogOpen(false);
      } else {
        console.error("Fehler beim Logging des Sprays:", await response.text());
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Fehler beim Logging des Sprays:", error);
      setIsLoading(false);
    }
  };

  const logAppointment = async (time: string): Promise<void> => {
    if (!userData) {
      alert("Bitte melde dich an, um fortzufahren.");
      return;
    }
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch("/api/cat-spray/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          userName: userData.username,
          time: time,
          date: today,
          timestamp: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        // Send notifications after successful logging
        await notifyOthers(time);

        fetchLastSprayData();
        fetchSprayCount();
        fetchCompletedAppointments();
        setIsDialogOpen(false);
      } else {
        console.error(
          "Fehler beim Logging des Termins:",
          await response.text()
        );
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Fehler beim Logging des Termins:", error);
      setIsLoading(false);
    }
  };

  // Neue Funktion zum Senden von Benachrichtigungen an andere Benutzer
  const notifyOthers = async (time?: string): Promise<void> => {
    if (!userData) return;

    try {
      setNotificationStatus("Benachrichtigungen werden gesendet...");

      // Get API key from environment or storage if needed
      const apiKey = process.env.NEXT_PUBLIC_REMINDER_API_KEY || "";

      const response = await fetch("/api/notify-others", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          userId: userData.id,
          userName: userData.username,
          catName: "Pebbles", // Default name or fetch from settings
          time:
            time ||
            new Date().toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
            }),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNotificationStatus(`${result.sent} Benachrichtigungen gesendet`);
      } else {
        setNotificationStatus("Keine Benachrichtigungen gesendet");
      }

      // Reset status after 3 seconds
      setTimeout(() => {
        setNotificationStatus("");
      }, 3000);
    } catch (error) {
      console.error("Fehler beim Senden der Benachrichtigungen:", error);
      setNotificationStatus("Fehler beim Senden der Benachrichtigungen");

      // Reset status after 3 seconds
      setTimeout(() => {
        setNotificationStatus("");
      }, 3000);
    }
  };

  const formatDateTime = (timestamp: string | undefined): string => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("de-DE");
  };

  const openAppointmentDialog = (time: string): void => {
    setCurrentAppointment(time);
    setIsDialogOpen(true);
  };

  const isAppointmentCompleted = (time: string): boolean => {
    return completedAppointments.some((app) => app.time === time);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const goToAdminPanel = (): void => {
    window.location.href = "/admin";
  };

  const logout = () => {
    Cookies.remove("catSprayUser");
    setIsLoggedIn(false);
    setUserData(null);
  };

  const sortedTimes = [...scheduledTimes].sort((a, b) => a.localeCompare(b));

  const renderLoading = () => (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p style={styles.loadingText}>Lädt...</p>
    </div>
  );

  const handleLogin = (user: UserData) => {
    setUserData(user);
    setIsLoggedIn(true);
    setIsSettingsModalOpen(false);
  };

  // Hilfsfunktion für Anzeige der verbleibenden Tage
  const getResetInfo = () => {
    if (!resetDate) return null;
    const reset = new Date(resetDate);
    const nextChange = new Date(reset.getTime() + 60 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const diff = Math.ceil(
      (nextChange.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      reset: reset.toLocaleDateString("de-DE"),
      nextChange: nextChange.toLocaleDateString("de-DE"),
      daysLeft: diff,
    };
  };

  return (
    <div style={styles.container}>
      {isSettingsModalOpen && (
        <div
          style={styles.backdrop}
          onClick={() => setIsSettingsModalOpen(false)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Einstellungen</h3>
              <button
                style={styles.modalButton}
                onClick={() => setIsSettingsModalOpen(false)}
              >
                Schließen
              </button>
            </div>
            {!isLoggedIn ? (
              <UserManagement onLogin={handleLogin} />
            ) : (
              <PushNotificationToggle />
            )}
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.logo}>
          <Droplet size={24} style={styles.logoIcon} />
          <h1 style={styles.title}>Katzen-Spray Tracker</h1>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={styles.navButton}
            onClick={() => setIsSettingsModalOpen(true)}
          >
            <Settings size={16} />
            Einstellungen
          </button>
          {isLoggedIn && (
            <button
              style={styles.navButton}
              className="primary-button"
              onClick={goToAdminPanel}
            >
              Admin-Panel
            </button>
          )}
        </div>
      </div>

      {isLoggedIn ? (
        <>
          <div style={styles.grid}>
            <div style={styles.card} className="hover-card">
              <div style={styles.cardHeader}>
                <User size={18} style={styles.cardIcon} />
                <h2 style={styles.cardTitle}>Benutzerprofil</h2>
              </div>
              <div style={styles.cardContent}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "#6366f1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "24px",
                      }}
                    >
                      {userData?.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          margin: "0",
                        }}
                      >
                        {userData?.username}
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          margin: "0",
                        }}
                      >
                        ID: {userData?.id}
                      </p>
                    </div>
                  </div>
                  <button
                    style={styles.iconButton}
                    className="icon-button"
                    onClick={logout}
                    title="Abmelden"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.card} className="hover-card">
              <div style={styles.cardHeader}>
                <Droplet size={18} style={styles.cardIcon} />
                <h2 style={styles.cardTitle}>Ampullen-Zähler</h2>
              </div>
              <div style={styles.ampulleContent}>
                <div style={styles.ampulleMain}>
                  <p style={styles.countDisplay}>{sprayCount}</p>
                  <p style={styles.ampulleDescription}>Verwendete Sprühstöße</p>
                </div>
                {getResetInfo() && (
                  <div style={styles.ampulleResetInfo}>
                    <div style={styles.ampulleResetItem}>
                      <div style={styles.ampulleResetItemTop}>
                        <Calendar size={16} color="#6366f1" />
                        <span style={styles.ampulleResetTitle}>
                          Letzter Reset
                        </span>
                      </div>
                      <div style={styles.ampulleResetValue}>
                        {getResetInfo()!.reset}
                      </div>
                    </div>
                    <div style={styles.ampulleResetItem}>
                      <div style={styles.ampulleResetItemTop}>
                        <Clock size={16} color="#6366f1" />
                        <span style={styles.ampulleResetTitle}>
                          Nächster Wechsel
                        </span>
                      </div>
                      <div style={styles.ampulleResetValue}>
                        {getResetInfo()!.nextChange}
                      </div>
                    </div>
                    <div style={styles.ampulleResetItem}>
                      <div style={styles.ampulleResetItemTop}>
                        <AlertTriangle size={16} color="#6366f1" />
                        <span style={styles.ampulleResetTitle}>
                          Verbleibend
                        </span>
                      </div>
                      <div style={styles.ampulleResetValue}>
                        {getResetInfo()!.daysLeft > 0
                          ? `${getResetInfo()!.daysLeft} Tag${
                              getResetInfo()!.daysLeft !== 1 ? "e" : ""
                            }`
                          : "0 Tage"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.card} className="hover-card">
              <div style={styles.cardHeader}>
                <Clock size={18} style={styles.cardIcon} />
                <h2 style={styles.cardTitle}>Letzte Anwendung</h2>
              </div>
              <div style={styles.cardContent}>
                {isLoading ? (
                  renderLoading()
                ) : lastSprayData ? (
                  <div>
                    <p style={styles.text}>
                      <span style={styles.strong}>Benutzer:</span>{" "}
                      {lastSprayData.userName}
                    </p>
                    <p style={styles.text}>
                      <span style={styles.strong}>Zeitpunkt:</span>{" "}
                      {formatDateTime(lastSprayData.timestamp)}
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#6b7280",
                    }}
                  >
                    <AlertTriangle size={16} />
                    <p style={styles.text}>Keine Einträge vorhanden.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            style={{ ...styles.card, marginTop: "16px" }}
            className="hover-card"
          >
            <div style={styles.cardHeader}>
              <Calendar size={18} style={styles.cardIcon} />
              <h2 style={styles.cardTitle}>Heutige Termine</h2>
            </div>
            <div style={styles.cardContent}>
              <p style={styles.todayDate}>
                <Calendar size={16} />
                {formatDate(new Date())}
              </p>
              <div style={styles.appointmentList}>
                {sortedTimes.length > 0 ? (
                  sortedTimes.map((time, index) => {
                    const completed = isAppointmentCompleted(time);
                    const completedBy = completed
                      ? completedAppointments.find((app) => app.time === time)
                          ?.userName
                      : null;
                    const isHovered = hoveredAppointment === time;
                    return (
                      <div
                        key={index}
                        style={{
                          ...styles.appointmentCard,
                          ...(isHovered && !completed
                            ? {
                                boxShadow:
                                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                transform: "translateY(-2px)",
                              }
                            : {}),
                        }}
                        onMouseEnter={() => setHoveredAppointment(time)}
                        onMouseLeave={() => setHoveredAppointment(null)}
                      >
                        <div style={styles.appointmentTime}>
                          <Clock size={16} color="#6366f1" />
                          {time} Uhr
                        </div>
                        <div style={styles.appointmentStatus}>
                          {completed ? (
                            <div style={styles.completedBadge}>
                              <Check size={14} />
                              Erledigt von {completedBy}
                            </div>
                          ) : (
                            <button
                              style={{
                                ...styles.appointmentButton,
                                ...(isLoading || !userData
                                  ? styles.disabled
                                  : {}),
                              }}
                              className="appointment-button"
                              onClick={() => openAppointmentDialog(time)}
                              disabled={isLoading || !userData}
                            >
                              <Check size={14} />
                              Jetzt erledigen
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#6b7280",
                      padding: "16px 0",
                    }}
                  >
                    <AlertTriangle size={16} />
                    <p style={styles.text}>
                      Keine Termine gefunden. Bitte im Admin-Panel
                      konfigurieren.
                    </p>
                  </div>
                )}
              </div>
              <button
                style={{
                  ...styles.button,
                  marginTop: "20px",
                  ...(isLoading || !userData ? styles.disabled : {}),
                }}
                className="primary-button"
                onClick={() => {
                  setCurrentAppointment(null);
                  setIsDialogOpen(true);
                }}
                disabled={isLoading || !userData}
              >
                <Plus size={16} />
                Zusätzliche Spray-Gabe eintragen
              </button>
            </div>
          </div>

          {isDialogOpen && (
            <div style={styles.backdrop}>
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <h3 style={styles.modalTitle}>
                    <Droplet size={20} color="#6366f1" />
                    Spray-Gabe bestätigen
                  </h3>
                  <p style={styles.modalDescription}>
                    {currentAppointment
                      ? `Bestätige, dass ${userData?.username} der Katze das Spray um ${currentAppointment} Uhr gegeben hat.`
                      : `Bestätige, dass ${userData?.username} der Katze das Spray gegeben hat.`}
                  </p>
                </div>

                <div style={styles.modalContent}>
                  {isLoading && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 0",
                      }}
                    >
                      <div style={styles.loadingSpinnerSmall} />
                      <span>Wird verarbeitet...</span>
                    </div>
                  )}
                </div>

                <div style={styles.modalFooter}>
                  <button
                    style={{
                      ...styles.modalButton,
                      ...styles.modalCancel,
                      flex: 1,
                      maxWidth: "120px",
                    }}
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Abbrechen
                  </button>
                  <button
                    style={{
                      ...styles.modalButton,
                      ...styles.modalConfirm,
                      flex: 1,
                      maxWidth: "200px",
                      ...(isLoading ? styles.disabled : {}),
                    }}
                    onClick={() =>
                      currentAppointment
                        ? logAppointment(currentAppointment)
                        : logSpray()
                    }
                    disabled={isLoading}
                  >
                    <Check size={18} />
                    Bestätigen
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <UserPlus
            size={48}
            color="#6366f1"
            style={{ marginBottom: "20px" }}
          />
          <h2>Bitte melden Sie sich an</h2>
          <p>
            Um den Katzen-Spray Tracker zu nutzen, müssen Sie sich anmelden oder
            registrieren.
          </p>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            style={{
              ...styles.button,
              marginTop: "20px",
            }}
          >
            Anmelden
          </button>
        </div>
      )}
    </div>
  );
};

export default CatSprayTracker;
