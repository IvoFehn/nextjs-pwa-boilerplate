import React, { useState, useEffect, FC, ChangeEvent } from "react";
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
} from "lucide-react";

// Interfaces
interface User {
  id: string;
  name: string;
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
  // Core
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
  // Header
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
  // Cards
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
  },
  // Form elements
  formGroup: {
    marginBottom: "20px",
  },
  flexContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userDisplay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  userName: {
    fontWeight: "600",
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
    fontSize: "14px",
    color: "#4b5563",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    backgroundColor: "#fff",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    WebkitAppearance: "none" as const,
    MozAppearance: "none" as const,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "16px 16px",
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
  secondaryButton: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
  },
  disabled: {
    opacity: "0.6",
    cursor: "not-allowed",
  },
  // Text styles
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
  // Modal
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
    maxWidth: "400px",
    width: "100%",
    overflow: "hidden",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  modalHeader: {
    padding: "20px",
    borderBottom: "1px solid #f3f4f6",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 8px 0",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  modalDescription: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
    lineHeight: "1.5",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#f9fafb",
  },
  modalButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    transition: "background-color 0.2s ease",
  },
  modalCancel: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
  },
  modalConfirm: {
    backgroundColor: "#6366f1",
    color: "white",
  },
  // Appointments
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
  appointmentCardHover: {
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transform: "translateY(-2px)",
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
  pendingBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 8px 4px 6px",
    borderRadius: "6px",
    fontSize: "12px",
    backgroundColor: "#f59e0b",
    color: "white",
    fontWeight: "500",
  },
  // Loading state
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
  loadingText: {
    fontSize: "14px",
    color: "#6b7280",
  },
  // Responsive adjustments
  "@media (max-width: 640px)": {
    grid: {
      gridTemplateColumns: "1fr",
    },
    modal: {
      width: "calc(100% - 32px)",
    },
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
    
    .secondary-button:hover {
      background-color: #e5e7eb;
    }
    
    .appointment-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
    }
    
    .appointment-button:hover {
      background-color: #4f46e5;
    }
    
    @media (max-width: 640px) {
      .grid {
        grid-template-columns: 1fr;
      }
      
      .modal {
        width: calc(100% - 32px);
      }
    }
  `;
  document.head.appendChild(styleEl);
};

const CatSprayTracker: FC = () => {
  // Füge die Styles zum Dokument hinzu
  useEffect(() => {
    createStyleSheet();
  }, []);

  const [selectedUser, setSelectedUser] = useState<string>("");
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
  const [userLocked, setUserLocked] = useState<boolean>(false);
  const [hoveredAppointment, setHoveredAppointment] = useState<string | null>(
    null
  );

  // Benutzer
  const users: User[] = [
    { id: "user1", name: "Ivo" },
    { id: "user2", name: "Michelle" },
  ];

  // Ausgewählten Benutzer und Lock-Status aus localStorage laden und Daten abrufen
  useEffect(() => {
    const savedUser = localStorage.getItem("selectedUser");
    const savedLockStatus = localStorage.getItem("userLocked");

    if (savedUser) {
      setSelectedUser(savedUser);
    }

    if (savedLockStatus === "true") {
      setUserLocked(true);
    }

    // Daten laden
    fetchLastSprayData();
    fetchSprayCount();
    fetchSettings();
    fetchCompletedAppointments();
  }, []);

  // Benutzer im localStorage speichern
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem("selectedUser", selectedUser);
    }
  }, [selectedUser]);

  // Lock-Status im localStorage speichern
  useEffect(() => {
    localStorage.setItem("userLocked", userLocked.toString());
  }, [userLocked]);

  // Einstellungen von MongoDB laden
  const fetchSettings = async (): Promise<void> => {
    try {
      const response = await fetch("/api/cat-spray/settings");
      const data: { settings: SettingsData } = await response.json();

      if (data && data.settings && data.settings.scheduledTimes) {
        setScheduledTimes(data.settings.scheduledTimes);
      } else {
        // Standardwerte, wenn keine Einstellungen vorhanden sind
        setScheduledTimes(["08:00", "20:00"]);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Einstellungen:", error);
      // Standardwerte bei Fehler
      setScheduledTimes(["08:00", "20:00"]);
    }
  };

  // Bereits erledigte Termine für heute laden
  const fetchCompletedAppointments = async (): Promise<void> => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD Format
      const response = await fetch(`/api/cat-spray/appointments?date=${today}`);
      const data: { appointments: AppointmentData[] } = await response.json();

      if (data && data.appointments) {
        setCompletedAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Fehler beim Laden der erledigten Termine:", error);
    }
  };

  // Letzte Spray-Daten von MongoDB laden
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

  // Spray-Zähler von MongoDB laden
  const fetchSprayCount = async (): Promise<void> => {
    try {
      const response = await fetch("/api/cat-spray/count");
      const data: { count: number } = await response.json();
      setSprayCount(data.count);
    } catch (error) {
      console.error("Fehler beim Laden des Spray-Zählers:", error);
    }
  };

  // Neuen Spray-Eintrag loggen für allgemeinen Button
  const logSpray = async (): Promise<void> => {
    if (!selectedUser) {
      alert("Bitte wähle zuerst einen Benutzer aus.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/cat-spray/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser,
          userName: users.find((user) => user.id === selectedUser)?.name,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Daten nach erfolgreichem Logging aktualisieren
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

  // Termin als erledigt markieren
  const logAppointment = async (time: string): Promise<void> => {
    if (!selectedUser) {
      alert("Bitte wähle zuerst einen Benutzer aus.");
      return;
    }

    try {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD Format

      const response = await fetch("/api/cat-spray/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser,
          userName: users.find((user) => user.id === selectedUser)?.name,
          time: time,
          date: today,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Aktualisiere die Daten nach erfolgreicher Protokollierung
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

  // Zeitstempel formatieren
  const formatDateTime = (timestamp: string | undefined): string => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("de-DE");
  };

  // Handle User Change
  const handleUserChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectedUser(e.target.value);
  };

  // Benutzer ein- oder auslocken
  const toggleUserLock = (): void => {
    setUserLocked(!userLocked);
  };

  // Benutzer entsperren und Auswahl ermöglichen
  const unlockUser = (): void => {
    setUserLocked(false);
  };

  // Öffne den Bestätigungsdialog für einen Termin
  const openAppointmentDialog = (time: string): void => {
    setCurrentAppointment(time);
    setIsDialogOpen(true);
  };

  // Prüfe, ob ein Termin bereits erledigt ist
  const isAppointmentCompleted = (time: string): boolean => {
    return completedAppointments.some((app) => app.time === time);
  };

  // Formatiere das heutige Datum
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Navigiere zum Admin-Panel
  const goToAdminPanel = (): void => {
    window.location.href = "/admin";
  };

  // Sortiere die Termine nach der Uhrzeit
  const sortedTimes = [...scheduledTimes].sort((a, b) => {
    return a.localeCompare(b);
  });

  // Rendering des Loading-Zustands
  const renderLoading = () => (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner}></div>
      <p style={styles.loadingText}>Lädt...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header mit Logo */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <Droplet size={24} style={styles.logoIcon} />
          <h1 style={styles.title}>Katzen-Spray Tracker</h1>
        </div>
        <button
          style={styles.navButton}
          className="primary-button"
          onClick={goToAdminPanel}
        >
          <Settings size={16} />
          Admin-Panel
        </button>
      </div>

      {/* Responsives Grid für Karten */}
      <div style={styles.grid}>
        {/* Benutzerauswahl Card */}
        <div style={styles.card} className="hover-card">
          <div style={styles.cardHeader}>
            <User size={18} style={styles.cardIcon} />
            <h2 style={styles.cardTitle}>Benutzerprofil</h2>
          </div>
          <div style={styles.cardContent}>
            {userLocked && selectedUser ? (
              // Anzeige wenn Benutzer eingelockt ist
              <div style={styles.userDisplay}>
                <span style={styles.userName}>
                  <User size={16} color="#6366f1" />
                  {users.find((user) => user.id === selectedUser)?.name}
                </span>
                <button
                  style={styles.iconButton}
                  className="icon-button"
                  onClick={unlockUser}
                  title="Benutzer entsperren"
                >
                  <Unlock size={18} />
                </button>
              </div>
            ) : (
              // Auswahlfeld wenn Benutzer nicht eingelockt ist
              <div style={styles.formGroup}>
                <div style={styles.flexContainer}>
                  <label style={styles.label} htmlFor="userSelect">
                    Benutzer auswählen:
                  </label>
                  {selectedUser && (
                    <button
                      style={styles.iconButton}
                      className="icon-button"
                      onClick={toggleUserLock}
                      title="Benutzer einlocken"
                    >
                      <Lock
                        size={18}
                        color={userLocked ? "#6366f1" : undefined}
                      />
                    </button>
                  )}
                </div>
                <select
                  id="userSelect"
                  style={styles.select}
                  value={selectedUser}
                  onChange={handleUserChange}
                >
                  <option value="">Benutzer auswählen</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Zähler Card */}
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

        {/* Letzte Anwendung Card */}
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

      {/* Heutige Termine Card (volle Breite) */}
      <div style={{ ...styles.card, marginTop: "16px" }} className="hover-card">
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
                        ? styles.appointmentCardHover
                        : {}),
                    }}
                    className={!completed ? "appointment-card" : ""}
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
                            ...(isLoading || !selectedUser
                              ? styles.disabled
                              : {}),
                          }}
                          className="appointment-button"
                          onClick={() => openAppointmentDialog(time)}
                          disabled={isLoading || !selectedUser}
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
                  Keine Termine gefunden. Bitte im Admin-Panel konfigurieren.
                </p>
              </div>
            )}
          </div>

          {/* Manueller Eintrag Button */}
          <button
            style={{
              ...styles.button,
              marginTop: "20px",
              ...(isLoading || !selectedUser ? styles.disabled : {}),
            }}
            className="primary-button"
            onClick={() => {
              setCurrentAppointment(null);
              setIsDialogOpen(true);
            }}
            disabled={isLoading || !selectedUser}
          >
            <Plus size={16} />
            Zusätzliche Spray-Gabe eintragen
          </button>
        </div>
      </div>

      {/* Bestätigungsdialog */}
      {isDialogOpen && (
        <div style={styles.backdrop}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <Droplet size={18} color="#6366f1" />
                Spray-Gabe bestätigen
              </h3>
              <p style={styles.modalDescription}>
                {currentAppointment
                  ? `Bestätige, dass ${
                      users.find((user) => user.id === selectedUser)?.name
                    } der Katze das Spray um ${currentAppointment} Uhr gegeben hat.`
                  : `Bestätige, dass ${
                      users.find((user) => user.id === selectedUser)?.name
                    } der Katze das Spray gegeben hat.`}
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={{ ...styles.modalButton, ...styles.modalCancel }}
                onClick={() => setIsDialogOpen(false)}
              >
                Abbrechen
              </button>
              <button
                style={{
                  ...styles.modalButton,
                  ...styles.modalConfirm,
                  ...(isLoading ? styles.disabled : {}),
                }}
                onClick={() =>
                  currentAppointment
                    ? logAppointment(currentAppointment)
                    : logSpray()
                }
                disabled={isLoading}
              >
                <Check size={16} />
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatSprayTracker;
