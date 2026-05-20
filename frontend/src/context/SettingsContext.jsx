import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

const defaultSettings = {
  aiTone: "Academic",
  responseLength: "Medium",
  streaming: true,
  darkMode: false,
  accent: "cyan",
  studyGoal: 4,
  weakSubject: "Mathematics",
  adaptiveLearning: true,
  notifications: true,
  soundEffects: true,
  voiceAssistant: false,
  fontSize: "Medium",
  language: "English",
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("studentgpt_settings");
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("studentgpt_settings", JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Apply font size to document
  useEffect(() => {
    const sizes = { Small: "14px", Medium: "16px", Large: "18px", "Extra Large": "20px" };
    document.documentElement.style.fontSize = sizes[settings.fontSize] || "16px";
  }, [settings.fontSize]);

  // Apply accent color CSS variable
  useEffect(() => {
    const accents = {
      cyan:   { primary: "#06b6d4", glow: "rgba(6,182,212,0.2)" },
      purple: { primary: "#a855f7", glow: "rgba(168,85,247,0.2)" },
      green:  { primary: "#10b981", glow: "rgba(16,185,129,0.2)" },
      orange: { primary: "#f97316", glow: "rgba(249,115,22,0.2)" },
    };
    const chosen = accents[settings.accent] || accents.cyan;
    document.documentElement.style.setProperty("--accent-primary", chosen.primary);
    document.documentElement.style.setProperty("--accent-glow",    chosen.glow);
  }, [settings.accent]);

  const resetSettings = () => setSettings(defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, resetSettings, defaultSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);