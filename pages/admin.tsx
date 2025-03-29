import React, { useState, useEffect, FC, ChangeEvent } from "react";
import {
  PlusCircle,
  Trash2,
  RotateCcw,
  Home,
  Settings,
  Clock,
  ChevronLeft,
  Lock,
  Droplet,
  AlertTriangle,
  Check,
  Users,
} from "lucide-react";

// Interfaces
interface SettingsData {
  dailyFrequency: number;
  scheduledTimes: string[];
}

interface StylesObject {
  [key: string]:
    | React.CSSProperties
    | {
        [key: string]: React.CSSProperties;
      };
}

interface UserProfile {
  id: string;
  name: string;
}

// Modernes CSS im gleichen Stil wie der Haupttracker
const styles: StylesObject = {
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
    marginBottom: "20px",
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
  cardDescription: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "4px 0 0 0",
  },
  cardContent: {
    padding: "20px",
  },
  // Form elements
  formGroup: {
    marginBottom: "20px",
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
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    backgroundSize: "16px 16px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    backgroundColor: "#fff",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    boxSizing: "border-box" as const,
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "12px 16px",
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
  outlineButton: {
    backgroundColor: "transparent",
    color: "#6366f1",
    border: "1px solid #6366f1",
    marginTop: "12px",
  },
  dangerButton: {
    backgroundColor: "#ef4444",
    color: "white",
  },
  secondaryButton: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
  },
  disabled: {
    opacity: "0.6",
    cursor: "not-allowed",
  },
  separator: {
    borderTop: "1px solid #f3f4f6",
    margin: "20px 0",
  },
  timeInputGroup: {
    display: "flex",
    alignItems: "center",
    marginTop: "8px",
    gap: "8px",
  },
  timeInput: {
    flex: "1",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
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
  // Modal
  backdrop: {
    position: "fixed",
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
  modalDanger: {
    backgroundColor: "#ef4444",
    color: "white",
  },
  // Dev bereich
  devCard: {
    borderColor: "#9333ea",
    borderWidth: "1px",
    borderStyle: "solid",
  },
  successAlert: {
    padding: "12px 16px",
    backgroundColor: "#d1fae5",
    borderRadius: "8px",
    color: "#047857",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  errorAlert: {
    padding: "12px 16px",
    backgroundColor: "#fee2e2",
    borderRadius: "8px",
    color: "#b91c1c",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  userItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
    marginBottom: "8px",
  },
  userItemText: {
    fontWeight: "500",
  },
  // Text
  hint: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "8px",
    fontStyle: "italic",
  },
  // Responsive
  "@media (max-width: 640px)": {
    grid: {
      gridTemplateColumns: "1fr",
    },
  },
};

// Definiere die animierten Styles als CSS-Klassen
const createStyleSheet = () => {
  const styleEl = document.createElement("style");
  styleEl.textContent = `
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
    
    .outline-button:hover {
      background-color: #f3f4f6;
    }
    
    .danger-button:hover {
      background-color: #dc2626;
    }
    
    .secondary-button:hover {
      background-color: #e5e7eb;
    }
    
    @media (max-width: 640px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(styleEl);
};

const CatSprayAdminControl: FC = () => {
  // Füge die Styles zum Dokument hinzu
  useEffect(() => {
    createStyleSheet();
  }, []);

  const [spraySettings, setSpraySettings] = useState<SettingsData>({
    dailyFrequency: 2,
    scheduledTimes: ["08:00", "20:00"],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [currentCount, setCurrentCount] = useState<number>(0);

  // Dev-Bereich Status
  const [devPassword, setDevPassword] = useState<string>("");
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [isDevLoading, setIsDevLoading] = useState<boolean>(false);
  const [devMessage, setDevMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);

  // Lade Einstellungen beim Start
  useEffect(() => {
    fetchSettings();
    fetchSprayCount();
  }, []);

  // Einstellungen von MongoDB laden
  const fetchSettings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cat-spray/settings");
      const data: { settings: SettingsData } = await response.json();

      if (data && data.settings) {
        setSpraySettings({
          dailyFrequency: data.settings.dailyFrequency || 2,
          scheduledTimes: data.settings.scheduledTimes || ["08:00", "20:00"],
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Fehler beim Laden der Einstellungen:", error);
      setIsLoading(false);
    }
  };

  // Spray-Zähler von MongoDB laden
  const fetchSprayCount = async (): Promise<void> => {
    try {
      const response = await fetch("/api/cat-spray/count");
      const data: { count: number } = await response.json();
      setCurrentCount(data.count || 0);
    } catch (error) {
      console.error("Fehler beim Laden des Spray-Zählers:", error);
    }
  };

  // Zeit hinzufügen
  const addScheduledTime = (): void => {
    setSpraySettings((prev) => ({
      ...prev,
      scheduledTimes: [...prev.scheduledTimes, "12:00"],
    }));
  };

  // Zeit entfernen
  const removeScheduledTime = (index: number): void => {
    setSpraySettings((prev) => ({
      ...prev,
      scheduledTimes: prev.scheduledTimes.filter((_, i) => i !== index),
    }));
  };

  // Zeit aktualisieren
  const updateScheduledTime = (index: number, value: string): void => {
    setSpraySettings((prev) => {
      const newTimes = [...prev.scheduledTimes];
      newTimes[index] = value;
      return {
        ...prev,
        scheduledTimes: newTimes,
      };
    });
  };

  // Einstellungen speichern
  const saveSettings = async (): Promise<void> => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/cat-spray/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: spraySettings,
        }),
      });

      if (response.ok) {
        setDevMessage({
          type: "success",
          text: "Einstellungen erfolgreich gespeichert!",
        });

        // Nachricht nach 3 Sekunden ausblenden
        setTimeout(() => {
          setDevMessage(null);
        }, 3000);
      } else {
        setDevMessage({
          type: "error",
          text: "Fehler beim Speichern der Einstellungen!",
        });
        console.error("Fehler beim Speichern:", await response.text());
      }
      setIsSaving(false);
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
      setDevMessage({
        type: "error",
        text: "Fehler beim Speichern der Einstellungen!",
      });
      setIsSaving(false);
    }
  };

  // Zähler zurücksetzen
  const resetCounter = async (): Promise<void> => {
    try {
      setIsResetting(true);
      const response = await fetch("/api/cat-spray/reset-counter", {
        method: "POST",
      });

      if (response.ok) {
        setDevMessage({
          type: "success",
          text: "Zähler erfolgreich zurückgesetzt!",
        });
        fetchSprayCount();

        // Nachricht nach 3 Sekunden ausblenden
        setTimeout(() => {
          setDevMessage(null);
        }, 3000);
      } else {
        setDevMessage({
          type: "error",
          text: "Fehler beim Zurücksetzen des Zählers!",
        });
        console.error("Fehler beim Zurücksetzen:", await response.text());
      }
      setIsResetting(false);
      setIsResetDialogOpen(false);
    } catch (error) {
      console.error("Fehler beim Zurücksetzen des Zählers:", error);
      setDevMessage({
        type: "error",
        text: "Fehler beim Zurücksetzen des Zählers!",
      });
      setIsResetting(false);
      setIsResetDialogOpen(false);
    }
  };

  // Häufigkeit ändern
  const handleFrequencyChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const frequency = parseInt(e.target.value, 10);
    const currentTimes = [...spraySettings.scheduledTimes];

    // Wenn neue Häufigkeit niedriger ist, kürze die Liste
    if (frequency < currentTimes.length) {
      currentTimes.length = frequency;
    }
    // Wenn neue Häufigkeit höher ist, füge Standardzeiten hinzu
    else if (frequency > currentTimes.length) {
      const defaultTimes = ["08:00", "12:00", "16:00", "20:00"];
      while (currentTimes.length < frequency) {
        const nextTimeIndex = currentTimes.length % defaultTimes.length;
        currentTimes.push(defaultTimes[nextTimeIndex]);
      }
    }

    setSpraySettings({
      dailyFrequency: frequency,
      scheduledTimes: currentTimes,
    });
  };

  // Dev-Bereich Funktionen
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Einfache Passwortprüfung - in einer echten App sollte dies sicherer sein
    if (devPassword === "admin123") {
      setIsDevMode(true);
      setDevMessage({
        type: "success",
        text: "Entwicklermodus aktiviert",
      });
      // Benutzerprofile laden
      fetchUserProfiles();
    } else {
      setDevMessage({
        type: "error",
        text: "Falsches Passwort",
      });
    }
  };

  // Benutzerprofile laden
  const fetchUserProfiles = async () => {
    try {
      setIsDevLoading(true);
      // In einer echten App würde hier ein API-Aufruf stehen
      // Für die Demo verwenden wir Dummy-Daten
      setTimeout(() => {
        setUserProfiles([
          { id: "user1", name: "Ich" },
          { id: "user2", name: "Meine Freundin" },
        ]);
        setIsDevLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Fehler beim Laden der Benutzerprofile:", error);
      setIsDevLoading(false);
    }
  };

  // Benutzerprofile initialisieren
  const initUserProfiles = async () => {
    try {
      setIsDevLoading(true);
      // In einer echten App würde hier ein API-Aufruf stehen
      // Simuliere einen erfolgreichen API-Aufruf
      setTimeout(() => {
        setUserProfiles([
          { id: "user1", name: "Ich" },
          { id: "user2", name: "Meine Freundin" },
        ]);
        setDevMessage({
          type: "success",
          text: "Benutzerprofile wurden initialisiert!",
        });
        setIsDevLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Fehler beim Initialisieren der Benutzerprofile:", error);
      setDevMessage({
        type: "error",
        text: "Fehler beim Initialisieren!",
      });
      setIsDevLoading(false);
    }
  };

  // Navigiere zurück zur Startseite
  const goToHomePage = (): void => {
    window.location.href = "/";
  };

  // Rendering des Loading-Zustands
  const renderLoading = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          border: "3px solid #f3f4f6",
          borderTop: "3px solid #6366f1",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      ></div>
      <p style={{ fontSize: "14px", color: "#6b7280" }}>Lädt...</p>
    </div>
  );

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <Settings size={24} style={styles.logoIcon} />
            <h1 style={styles.title}>Admin-Panel</h1>
          </div>
          <button
            style={styles.navButton}
            className="primary-button"
            onClick={goToHomePage}
          >
            <ChevronLeft size={16} />
            Zurück
          </button>
        </div>
        {renderLoading()}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header mit Logo und Navigation */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <Settings size={24} style={styles.logoIcon} />
          <h1 style={styles.title}>Admin-Panel</h1>
        </div>
        <button
          style={styles.navButton}
          className="primary-button"
          onClick={goToHomePage}
        >
          <Home size={16} />
          Zur Startseite
        </button>
      </div>

      {/* Erfolgsmeldung oder Fehlermeldung */}
      {devMessage && (
        <div
          style={
            devMessage.type === "success"
              ? styles.successAlert
              : styles.errorAlert
          }
        >
          {devMessage.type === "success" ? (
            <Check size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          {devMessage.text}
        </div>
      )}

      {/* Spray-Einstellungen Karte */}
      <div style={styles.card} className="hover-card">
        <div style={styles.cardHeader}>
          <Clock size={18} style={styles.cardIcon} />
          <div>
            <h2 style={styles.cardTitle}>Spray-Einstellungen</h2>
            <p style={styles.cardDescription}>
              Verwalte die Spray-Gabe-Einstellungen für deine Katze
            </p>
          </div>
        </div>
        <div style={styles.cardContent}>
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="frequency">
                Häufigkeit pro Tag:
              </label>
              <select
                id="frequency"
                style={styles.select}
                value={spraySettings.dailyFrequency.toString()}
                onChange={handleFrequencyChange}
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num.toString()}>
                    {num}x täglich
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.separator}></div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Geplante Uhrzeiten:</label>
              {spraySettings.scheduledTimes.map((time, index) => (
                <div key={index} style={styles.timeInputGroup}>
                  <input
                    type="time"
                    value={time}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateScheduledTime(index, e.target.value)
                    }
                    style={styles.timeInput}
                  />
                  {spraySettings.scheduledTimes.length > 1 && (
                    <button
                      style={styles.iconButton}
                      className="icon-button"
                      onClick={() => removeScheduledTime(index)}
                      title="Uhrzeit entfernen"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              {spraySettings.scheduledTimes.length <
                spraySettings.dailyFrequency && (
                <button
                  style={{ ...styles.button, ...styles.outlineButton }}
                  className="outline-button"
                  onClick={addScheduledTime}
                >
                  <PlusCircle size={16} />
                  Uhrzeit hinzufügen
                </button>
              )}
            </div>

            <button
              style={{
                ...styles.button,
                ...(isSaving ? styles.disabled : {}),
              }}
              className="primary-button"
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? "Speichern..." : "Einstellungen speichern"}
            </button>
          </div>
        </div>
      </div>

      {/* Ampullen-Verwaltung Karte */}
      <div style={styles.card} className="hover-card">
        <div style={styles.cardHeader}>
          <Droplet size={18} style={styles.cardIcon} />
          <div>
            <h2 style={styles.cardTitle}>Ampullen-Verwaltung</h2>
            <p style={styles.cardDescription}>
              Aktueller Zählerstand: <strong>{currentCount}</strong>
            </p>
          </div>
        </div>
        <div style={styles.cardContent}>
          <button
            style={{
              ...styles.button,
              ...styles.dangerButton,
              ...(isResetting ? styles.disabled : {}),
            }}
            className="danger-button"
            onClick={() => setIsResetDialogOpen(true)}
            disabled={isResetting}
          >
            <RotateCcw size={16} />
            Zähler zurücksetzen (neue Ampulle)
          </button>
        </div>
      </div>

      {/* Dev-Bereich Karte */}
      <div style={{ ...styles.card, ...styles.devCard }} className="hover-card">
        <div style={styles.cardHeader}>
          <Lock size={18} style={{ color: "#9333ea" }} />
          <div>
            <h2 style={styles.cardTitle}>Entwicklerbereich</h2>
            <p style={styles.cardDescription}>
              Geschützter Bereich für Systemadministration
            </p>
          </div>
        </div>
        <div style={styles.cardContent}>
          {!isDevMode ? (
            <form onSubmit={handlePasswordSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="devPassword">
                  Entwickler-Passwort:
                </label>
                <input
                  id="devPassword"
                  type="password"
                  style={styles.input}
                  value={devPassword}
                  onChange={(e) => setDevPassword(e.target.value)}
                  placeholder="Passwort eingeben"
                />
                <p style={styles.hint}>Hinweis: Das Passwort ist admin123</p>
              </div>
              <button
                type="submit"
                style={styles.button}
                className="primary-button"
              >
                <Lock size={16} />
                Entsperren
              </button>
            </form>
          ) : (
            <div>
              <div style={styles.formGroup}>
                <h3 style={{ ...styles.cardTitle, marginBottom: "16px" }}>
                  <Users
                    size={16}
                    style={{ display: "inline", marginRight: "6px" }}
                  />
                  Benutzerverwaltung
                </h3>

                {isDevLoading ? (
                  renderLoading()
                ) : (
                  <>
                    <div style={{ marginBottom: "16px" }}>
                      {userProfiles.length > 0 ? (
                        <div>
                          {userProfiles.map((user) => (
                            <div key={user.id} style={styles.userItem}>
                              <span style={styles.userItemText}>
                                {user.name}
                              </span>
                              <span
                                style={{ color: "#6b7280", fontSize: "12px" }}
                              >
                                ID: {user.id}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: "#6b7280", fontSize: "14px" }}>
                          Keine Benutzerprofile gefunden
                        </p>
                      )}
                    </div>

                    <button
                      style={styles.button}
                      className="primary-button"
                      onClick={initUserProfiles}
                      disabled={isDevLoading}
                    >
                      <Users size={16} />
                      Benutzerprofile initialisieren
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Dialog */}
      {isResetDialogOpen && (
        <div style={styles.backdrop}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <AlertTriangle size={18} color="#ef4444" />
                Zähler zurücksetzen?
              </h3>
              <p style={styles.modalDescription}>
                Bist du sicher, dass du den Zähler zurücksetzen möchtest? Dies
                sollte nur bei einer neuen Ampulle gemacht werden.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={{ ...styles.modalButton, ...styles.modalCancel }}
                onClick={() => setIsResetDialogOpen(false)}
              >
                Abbrechen
              </button>
              <button
                style={{
                  ...styles.modalButton,
                  ...styles.modalDanger,
                  ...(isResetting ? styles.disabled : {}),
                }}
                onClick={resetCounter}
                disabled={isResetting}
              >
                {isResetting ? "Zurücksetzen..." : "Ja, zurücksetzen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatSprayAdminControl;
