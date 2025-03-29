/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warme, sanfte Hauptfarben
        kitty: {
          50: "#fff7ed", // Sehr helles Orange/Beige
          100: "#ffead5", // Sanftes, helles Pfirsich
          200: "#ffd5aa", // Warmes Pfirsich
          300: "#ffba7a", // Sanftes Orange
          400: "#ff9c54", // Warmes Orange
          500: "#f97316", // Standard Orange
          600: "#ea580c", // Dunkleres Orange
          700: "#c2410c", // Tiefes Orange
          800: "#9a3412", // Sehr dunkles Orange
          900: "#7c2d12", // Fast Braun
        },
        // Akzentfarben in Rosa/Violett (für süße Elemente)
        paws: {
          50: "#fdf4ff", // Sehr helles Rosa
          100: "#fae8ff", // Helles Rosa
          200: "#f5d0fe", // Sanftes Rosa
          300: "#f0abfc", // Mittleres Rosa
          400: "#e879f9", // Kräftiges Rosa
          500: "#d946ef", // Standard Rosa
          600: "#c026d3", // Dunkleres Rosa
          700: "#a21caf", // Tiefes Rosa/Violett
          800: "#86198f", // Dunkles Violett
          900: "#701a75", // Sehr dunkles Violett
        },
        // Neutrale Farben für Text und Hintergründe
        whiskers: {
          50: "#faf9f7", // Fast Weiß
          100: "#f5f5f0", // Sehr helles Grau/Beige
          200: "#e6e4dd", // Helles Beige
          300: "#d5d2c8", // Mittleres Beige/Grau
          400: "#a9a598", // Mittleres Grau
          500: "#78746a", // Standard Grau
          600: "#625e56", // Dunkleres Grau
          700: "#504d47", // Tiefes Grau
          800: "#3d3b36", // Sehr dunkles Grau
          900: "#2b2925", // Fast Schwarz
        },
        // Gemütliche Erdtöne für Hintergründe und Akzente
        nap: {
          50: "#fcf9f1", // Sehr helles Cremeweiß
          100: "#f9f4e3", // Cremeweiß
          200: "#f3e8c7", // Sanftes Beige
          300: "#e9d5a8", // Warmes Beige
          400: "#e0c285", // Mittleres Beige/Sandfarben
          500: "#d4aa60", // Standard Beige/Sand
          600: "#be8c45", // Dunkles Beige/Braun
          700: "#96663a", // Mittleres Braun
          800: "#7d5230", // Dunkles Braun
          900: "#64432a", // Sehr dunkles Braun
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: false, // DaisyUI-Themes deaktivieren
    base: false, // Grundstile deaktivieren
    styled: true, // Komponenten-Stile aktivieren
    utils: true, // Utility-Klassen aktivieren
    logs: true, // Logs aktivieren
  },
};
