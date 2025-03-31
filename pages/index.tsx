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
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto",
    padding: "16px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    color: "#1f2937",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    boxSizing: "border-box" as const,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    padding: "16px 20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    color: "#6366f1",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    margin: "0",
    color: "#111827",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    textDecoration: "none",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    height: "100%",
  },
  cardHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  cardIcon: {
    color: "#6366f1",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0",
    color: "#111827",
  },
  cardContent: {
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    height: "calc(100% - 57px)",
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
    transition: "background-color 0.2s ease, color 0.2s ease",
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "12px 20px",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  disabled: {
    opacity: "0.6",
    cursor: "not-allowed",
  },
  text: {
    margin: "4px 0",
    fontSize: "14px",
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
    margin: "12px 0",
  },
  todayDate: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  backdrop: {
    position: "fixed" as const,
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
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
    borderRadius: "12px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto" as const, // Typ als "auto" festlegen
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    margin: "20px",
  },
  modalHeader: {
    padding: "24px 24px 16px",
    borderBottom: "1px solid #f3f4f6",
    position: "sticky" as const, // Typ als "sticky" festlegen
    top: 0,
    backgroundColor: "white",
    zIndex: 10,
  },
  modalTitle: {
    fontSize: "clamp(18px, 4vw, 22px)", // Responsive Schriftgröße
    fontWeight: "600",
    margin: "0 0 8px 0",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  modalDescription: {
    fontSize: "clamp(14px, 3vw, 16px)", // Responsive Schriftgröße
    color: "#6b7280",
    margin: "0",
    lineHeight: "1.5",
  },
  modalContent: {
    padding: "24px",
  },
  modalFooter: {
    display: "flex",
    flexDirection: "row" as const, // als konstanter Literaltyp
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px 24px",
    backgroundColor: "#f9fafb",
    position: "sticky" as const,
    bottom: 0,
    borderTop: "1px solid #f3f4f6",
  },
  modalButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "clamp(14px, 3vw, 16px)",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s ease",
    minWidth: "100px", // Mindestbreite für Buttons
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
    gap: "10px",
  },
  appointmentCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #f3f4f6",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  appointmentTime: {
    fontWeight: "600",
    fontSize: "15px",
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
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    border: "none",
    backgroundColor: "#6366f1",
    color: "white",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  completedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 8px 4px 6px",
    borderRadius: "6px",
    fontSize: "12px",
    backgroundColor: "#10b981",
    color: "white",
    fontWeight: "500",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    gap: "12px",
  },
  loadingSpinner: {
    width: "24px",
    height: "24px",
    border: "3px solid #f3f4f6",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingSpinnerSmall: {
    width: "18px",
    height: "18px",
    border: "2px solid #f3f4f6",
    borderTop: "2px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "14px",
    color: "#6b7280",
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
      const data: { count: number } = await response.json();
      setSprayCount(data.count);
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
            <div
              style={{ ...styles.card, height: "200px" }}
              className="hover-card"
            >
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
              <div style={styles.cardContent}>
                <p style={styles.countDisplay}>{sprayCount}</p>
                <p style={styles.text}>
                  Verwendete Sprühstöße bei der aktuellen Ampulle
                </p>
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
