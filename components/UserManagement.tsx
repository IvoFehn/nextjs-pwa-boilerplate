import React, { useState, CSSProperties } from "react";
import { AlertTriangle } from "lucide-react";
import Cookies from "js-cookie";

// --- Konstanten ---
const API_ENDPOINT = "/api/auth";
const COOKIE_NAME = "catSprayUser";
const COOKIE_EXPIRY_DAYS = 180;

// --- Styles ---
const styles: { [key: string]: CSSProperties } = {
  container: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    margin: "0 auto",
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "20px",
    textAlign: "center" as const,
  },
  tabs: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  tabButton: {
    padding: "10px 15px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#6b7280",
    flexGrow: 1,
    textAlign: "center" as const,
    borderBottom: "3px solid transparent",
    transition: "color 0.2s ease, border-bottom-color 0.2s ease",
  },
  activeTab: {
    fontWeight: "600",
    color: "#6366f1",
    borderBottom: "3px solid #6366f1",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#111827",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s ease",
  },
  inputFocus: {
    borderColor: "#6366f1",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "background-color 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  buttonHover: {
    backgroundColor: "#4f46e5",
  },
  errorMessage: {
    color: "#ef4444",
    backgroundColor: "#fee2e2",
    marginBottom: "16px",
    padding: "10px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
};

// --- Schnittstelle ---
interface UserManagementProps {
  onLogin: (user: UserData) => void;
}

// --- Komponente ---
const UserManagement: React.FC<UserManagementProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 2) {
      setError("Benutzername muss mindestens 2 Zeichen lang sein.");
      return;
    }
    if (password.trim().length < 4) {
      setError("Passwort muss mindestens 4 Zeichen lang sein.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: isLoginMode ? "login" : "register",
          username,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Ein Fehler ist aufgetreten.");
      }

      const user: UserData = { id: data.user.id, username: data.user.username };
      Cookies.set(COOKIE_NAME, JSON.stringify(user), {
        expires: COOKIE_EXPIRY_DAYS,
      });
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = (mode: boolean) => {
    setIsLoginMode(mode);
    setError(null);
    setUsername("");
    setPassword("");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{isLoginMode ? "Anmelden" : "Registrieren"}</h2>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tabButton,
            ...(isLoginMode ? styles.activeTab : {}),
          }}
          onClick={() => handleModeSwitch(true)}
          disabled={isLoading}
        >
          Anmelden
        </button>
        <button
          style={{
            ...styles.tabButton,
            ...(!isLoginMode ? styles.activeTab : {}),
          }}
          onClick={() => handleModeSwitch(false)}
          disabled={isLoading}
        >
          Registrieren
        </button>
      </div>

      {/* Fehleranzeige */}
      {error && (
        <div style={styles.errorMessage}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Formular */}
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="username">
            Benutzername
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Dein Benutzername"
            style={styles.input}
            disabled={isLoading}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="password">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Dein Passwort"
            style={styles.input}
            disabled={isLoading}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
          />
        </div>

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(isLoading ? { opacity: 0.7, cursor: "not-allowed" } : {}),
          }}
          disabled={isLoading}
          onMouseEnter={(e) =>
            !isLoading && (e.currentTarget.style.backgroundColor = "#4f46e5")
          }
          onMouseLeave={(e) =>
            !isLoading && (e.currentTarget.style.backgroundColor = "#6366f1")
          }
        >
          {isLoading
            ? "Wird verarbeitet..."
            : isLoginMode
            ? "Anmelden"
            : "Registrieren"}
        </button>
      </form>
    </div>
  );
};

export default UserManagement;
