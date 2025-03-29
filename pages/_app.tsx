import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registriert mit Scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error(
            "Fehler bei der Registrierung des Service Workers:",
            error
          );
        });
    }
  }, []); // Leeres Array, damit useEffect nur einmal beim Mount ausgeführt wird

  return <Component {...pageProps} />;
}
