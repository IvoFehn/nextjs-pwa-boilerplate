import React, { useState, useEffect, FC, ChangeEvent } from "react";
import { PlusCircle, Trash2, RotateCcw } from "lucide-react";

// Interfaces
interface SettingsData {
  dailyFrequency: number;
  scheduledTimes: string[];
}

interface StylesObject {
  [key: string]: React.CSSProperties;
}

// Eigenes CSS
const styles: StylesObject = {
  container: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
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
    margin: "0 0 4px 0",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#666",
    margin: "0",
  },
  cardContent: {
    padding: "20px",
  },
  formGroup: {
    marginBottom: "16px",
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
  separator: {
    borderTop: "1px solid #eee",
    margin: "20px 0",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    marginTop: "8px",
    gap: "8px",
  },
  input: {
    flex: "1",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  buttonOutline: {
    width: "100%",
    padding: "10px",
    backgroundColor: "transparent",
    color: "#4f46e5",
    border: "1px solid #4f46e5",
    borderRadius: "4px",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "12px",
  },
  buttonDanger: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
    color: "white",
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
  disabled: {
    opacity: "0.6",
    cursor: "not-allowed",
  },
};

const CatSprayAdminControl: FC = () => {
  const [spraySettings, setSpraySettings] = useState<SettingsData>({
    dailyFrequency: 2,
    scheduledTimes: ["08:00", "20:00"],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [currentCount, setCurrentCount] = useState<number>(0);

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
        alert("Einstellungen erfolgreich gespeichert!");
      } else {
        alert("Fehler beim Speichern der Einstellungen!");
        console.error("Fehler beim Speichern:", await response.text());
      }
      setIsSaving(false);
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
      alert("Fehler beim Speichern der Einstellungen!");
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
        alert("Zähler erfolgreich zurückgesetzt!");
        fetchSprayCount();
      } else {
        alert("Fehler beim Zurücksetzen des Zählers!");
        console.error("Fehler beim Zurücksetzen:", await response.text());
      }
      setIsResetting(false);
      setIsResetDialogOpen(false);
    } catch (error) {
      console.error("Fehler beim Zurücksetzen des Zählers:", error);
      alert("Fehler beim Zurücksetzen des Zählers!");
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

  if (isLoading) {
    return <div style={styles.container}>Lade Einstellungen...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Spray-Einstellungen Karte */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Spray-Einstellungen</h2>
          <p style={styles.cardDescription}>
            Verwalte die Spray-Gabe-Einstellungen für deine Katze
          </p>
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
                <div key={index} style={styles.inputGroup}>
                  <input
                    type="time"
                    value={time}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateScheduledTime(index, e.target.value)
                    }
                    style={styles.input}
                  />
                  {spraySettings.scheduledTimes.length > 1 && (
                    <button
                      style={styles.iconButton}
                      onClick={() => removeScheduledTime(index)}
                      title="Uhrzeit entfernen"
                    >
                      <Trash2 size={16} color="#666" />
                    </button>
                  )}
                </div>
              ))}

              {spraySettings.scheduledTimes.length <
                spraySettings.dailyFrequency && (
                <button style={styles.buttonOutline} onClick={addScheduledTime}>
                  <PlusCircle size={16} />
                  Uhrzeit hinzufügen
                </button>
              )}
            </div>

            <button
              style={{
                ...styles.buttonPrimary,
                ...(isSaving ? styles.disabled : {}),
              }}
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? "Speichern..." : "Einstellungen speichern"}
            </button>
          </div>
        </div>
      </div>

      {/* Ampullen-Verwaltung Karte */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Ampullen-Verwaltung</h2>
          <p style={styles.cardDescription}>
            Aktueller Zählerstand: {currentCount}
          </p>
        </div>
        <div style={styles.cardContent}>
          <button
            style={{
              ...styles.buttonPrimary,
              ...styles.buttonDanger,
              ...(isResetting ? styles.disabled : {}),
            }}
            onClick={() => setIsResetDialogOpen(true)}
            disabled={isResetting}
          >
            <RotateCcw size={16} />
            Zähler zurücksetzen (neue Ampulle)
          </button>
        </div>
      </div>

      {/* Reset Dialog */}
      {isResetDialogOpen && (
        <div style={styles.backdrop}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Zähler zurücksetzen?</h3>
              <p style={styles.modalDescription}>
                Bist du sicher, dass du den Zähler zurücksetzen möchtest? Dies
                sollte nur bei einer neuen Ampulle gemacht werden.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={{
                  ...styles.modalButton,
                  border: "1px solid #ddd",
                  backgroundColor: "#f9fafb",
                }}
                onClick={() => setIsResetDialogOpen(false)}
              >
                Abbrechen
              </button>
              <button
                style={{
                  ...styles.modalButton,
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
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
