import React, { useState, useEffect, FC, ChangeEvent, MouseEvent } from "react";
import { Lock, Unlock, Settings } from "lucide-react";

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

// Styles Interface
interface StylesObject {
  [key: string]: React.CSSProperties;
}

// Eigenes CSS als JavaScript-Objekt
const styles: StylesObject = {
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  navTitle: {
    margin: "0",
    fontSize: "18px",
    fontWeight: "bold",
  },
  navLink: {
    padding: "8px 12px",
    backgroundColor: "#4f46e5",
    color: "white",
    textDecoration: "none",
    borderRadius: "4px",
    fontSize: "14px",
    cursor: "pointer",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
  },
  cardHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #eee",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0",
  },
  cardContent: {
    padding: "20px",
  },
  formGroup: {
    marginBottom: "16px",
  },
  flexContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userDisplay: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    backgroundColor: "#f0f4f8",
    borderRadius: "4px",
    marginBottom: "16px",
  },
  userName: {
    fontWeight: "bold",
    fontSize: "16px",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "6px",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  lockIcon: {
    marginLeft: "8px",
    cursor: "pointer",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "14px",
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  disabled: {
    opacity: "0.6",
    cursor: "not-allowed",
  },
  infoText: {
    margin: "4px 0",
    fontSize: "14px",
  },
  strongText: {
    fontWeight: "bold",
  },
  countDisplay: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
  },
  backdrop: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "1000",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    maxWidth: "400px",
    width: "90%",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  modalHeader: {
    marginBottom: "16px",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
  },
  modalDescription: {
    fontSize: "14px",
    color: "#666",
    margin: "0",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },
  modalButton: {
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  appointmentCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    marginBottom: "8px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    border: "1px solid #eee",
  },
  appointmentTime: {
    fontWeight: "bold",
    fontSize: "16px",
  },
  appointmentStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  appointmentButton: {
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "14px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "white",
    cursor: "pointer",
  },
  completedBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    backgroundColor: "#10b981",
    color: "white",
  },
  pendingBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    backgroundColor: "#f59e0b",
    color: "white",
  },
  todayDate: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "12px",
  },
};

const CatSprayTracker: FC = () => {
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

  // Benutzer
  const users: User[] = [
    { id: "user1", name: "Ich" },
    { id: "user2", name: "Meine Freundin" },
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

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <div style={styles.navigation}>
        <h1 style={styles.navTitle}>Katzen-Spray Tracker</h1>
        <button style={styles.navLink} onClick={goToAdminPanel}>
          Admin-Panel
        </button>
      </div>

      {/* Benutzerauswahl Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Benutzerprofil</h2>
        </div>
        <div style={styles.cardContent}>
          {userLocked && selectedUser ? (
            // Anzeige wenn Benutzer eingelockt ist
            <div style={styles.userDisplay}>
              <span style={styles.userName}>
                {users.find((user) => user.id === selectedUser)?.name}
              </span>
              <button
                style={styles.iconButton}
                onClick={unlockUser}
                title="Benutzer entsperren"
              >
                <Unlock size={20} color="#666" />
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
                    onClick={toggleUserLock}
                    title="Benutzer einlocken"
                  >
                    <Lock size={20} color={userLocked ? "#4f46e5" : "#666"} />
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

      {/* Heutige Termine Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Heutige Termine</h2>
        </div>
        <div style={styles.cardContent}>
          <p style={styles.todayDate}>{formatDate(new Date())}</p>

          {sortedTimes.length > 0 ? (
            sortedTimes.map((time, index) => {
              const completed = isAppointmentCompleted(time);
              const completedBy = completed
                ? completedAppointments.find((app) => app.time === time)
                    ?.userName
                : null;

              return (
                <div key={index} style={styles.appointmentCard}>
                  <div style={styles.appointmentTime}>{time} Uhr</div>
                  <div style={styles.appointmentStatus}>
                    {completed ? (
                      <div style={styles.completedBadge}>
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
                        onClick={() => openAppointmentDialog(time)}
                        disabled={isLoading || !selectedUser}
                      >
                        Jetzt erledigen
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p style={styles.infoText}>
              Keine Termine gefunden. Bitte im Admin-Panel konfigurieren.
            </p>
          )}

          {/* Manueller Eintrag Button */}
          <button
            style={{
              ...styles.button,
              marginTop: "16px",
              ...(isLoading || !selectedUser ? styles.disabled : {}),
            }}
            onClick={() => {
              setCurrentAppointment(null);
              setIsDialogOpen(true);
            }}
            disabled={isLoading || !selectedUser}
          >
            Zusätzliche Spray-Gabe eintragen
          </button>
        </div>
      </div>

      {/* Letzte Anwendung Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Letzte Anwendung</h2>
        </div>
        <div style={styles.cardContent}>
          {isLoading ? (
            <p style={styles.infoText}>Lädt...</p>
          ) : lastSprayData ? (
            <div>
              <p style={styles.infoText}>
                <span style={styles.strongText}>Benutzer:</span>{" "}
                {lastSprayData.userName}
              </p>
              <p style={styles.infoText}>
                <span style={styles.strongText}>Zeitpunkt:</span>{" "}
                {formatDateTime(lastSprayData.timestamp)}
              </p>
            </div>
          ) : (
            <p style={styles.infoText}>Keine Einträge vorhanden.</p>
          )}
        </div>
      </div>

      {/* Zähler Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Zähler aktuelle Ampulle</h2>
        </div>
        <div style={styles.cardContent}>
          <p style={styles.countDisplay}>{sprayCount}</p>
        </div>
      </div>

      {/* Bestätigungsdialog */}
      {isDialogOpen && (
        <div style={styles.backdrop}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Bestätigung</h3>
              <p style={styles.modalDescription}>
                {currentAppointment
                  ? `Bestätige, dass ${
                      users.find((user) => user.id === selectedUser)?.name
                    } gerade der Katze das Spray um ${currentAppointment} Uhr gegeben hat.`
                  : `Bestätige, dass ${
                      users.find((user) => user.id === selectedUser)?.name
                    } gerade der Katze das Spray gegeben hat.`}
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={{
                  ...styles.modalButton,
                  border: "1px solid #ddd",
                  backgroundColor: "#f9fafb",
                }}
                onClick={() => setIsDialogOpen(false)}
              >
                Abbrechen
              </button>
              <button
                style={{
                  ...styles.modalButton,
                  backgroundColor: "#4f46e5",
                  color: "white",
                  border: "none",
                  ...(isLoading ? styles.disabled : {}),
                }}
                onClick={() =>
                  currentAppointment
                    ? logAppointment(currentAppointment)
                    : logSpray()
                }
                disabled={isLoading}
              >
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
