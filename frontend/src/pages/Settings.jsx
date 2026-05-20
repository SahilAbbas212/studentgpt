import DashboardLayout from "../layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Brain, Moon, Sun, Bell, Palette, Volume2, Target,
  Sparkles, Shield, Cpu, Zap, Database, CheckCircle2,
  Save, RotateCcw, Mic, MicOff
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";
import useSessionTracker from "../hooks/useSessionTracker";

const Toggle = ({ value, onChange, color = "#06b6d4" }) => (
  <button
    onClick={() => onChange(!value)}
    className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300"
    style={{
      background: value
        ? `linear-gradient(135deg, ${color}, ${color}99)`
        : "rgba(255,255,255,0.08)",
      border: `1px solid ${value ? color : "rgba(255,255,255,0.1)"}`,
      boxShadow: value ? `0 0 16px ${color}55` : "none"
    }}
  >
    <div
      className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
      style={{ left: value ? "calc(100% - 22px)" : "2px" }}
    />
  </button>
);

const Card = ({ children, gradient, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative rounded-2xl p-6 overflow-hidden ${className}`}
    style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)"
    }}
  >
    {gradient && (
      <div className="absolute inset-0 opacity-[0.04] rounded-2xl" style={{ background: gradient }} />
    )}
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const SectionHeader = ({ icon, title, subtitle, gradient }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="p-2.5 rounded-xl text-white" style={{ background: gradient }}>
      {icon}
    </div>
    <div>
      <h2 className="text-base font-bold text-white">{title}</h2>
      <p className="text-xs" style={{ color: "rgba(148,163,184,0.6)" }}>{subtitle}</p>
    </div>
  </div>
);

const Row = ({ label, sublabel, children }) => (
  <div
    className="flex items-center justify-between py-3 px-4 rounded-xl"
    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}
  >
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      {sublabel && <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>{sublabel}</p>}
    </div>
    {children}
  </div>
);

const StyledSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white outline-none transition-all duration-300"
    style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      cursor: "pointer"
    }}
  >
    {options.map(o => (
      <option key={o} value={o} style={{ background: "#0a0f2e" }}>{o}</option>
    ))}
  </select>
);

function Settings() {
  useSessionTracker("Settings");

  const context = useSettings();
  const { darkMode, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [notification, setNotification] = useState("");

  if (!context) {
    return (
      <DashboardLayout>
        <div className="p-10 text-red-400">Settings Context Not Found</div>
      </DashboardLayout>
    );
  }

  const { settings, setSettings, resetSettings } = context;
  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    localStorage.setItem("studentgpt_settings", JSON.stringify(settings));
    setSaved(true);
    setNotification("Settings saved successfully!");
    setTimeout(() => { setSaved(false); setNotification(""); }, 2500);
  };

  const handleReset = () => {
    resetSettings();
    setNotification("Settings reset to defaults");
    setTimeout(() => setNotification(""), 2500);
  };

  // Apply sound effects
  const playClick = () => {
    if (!settings.soundEffects) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  };

  const themes = [
    { name: "cyan",   gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
    { name: "purple", gradient: "linear-gradient(135deg, #a855f7, #ec4899)" },
    { name: "green",  gradient: "linear-gradient(135deg, #10b981, #06b6d4)" },
    { name: "orange", gradient: "linear-gradient(135deg, #f97316, #ef4444)" },
  ];

  const statusCards = [
    { label: "AI Engine",     value: "Groq Connected",                              gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)", icon: <Cpu size={16} />,          color: "#06b6d4" },
    { label: "Streaming",     value: settings?.streaming ? "Enabled" : "Disabled",  gradient: "linear-gradient(135deg,#a855f7,#ec4899)", icon: <Zap size={16} />,          color: "#a855f7" },
    { label: "AI Memory",     value: settings?.adaptiveLearning ? "Adaptive Active" : "Disabled", gradient: "linear-gradient(135deg,#10b981,#06b6d4)", icon: <Database size={16} />, color: "#10b981" },
    { label: "System Status", value: "Operational",                                 gradient: "linear-gradient(135deg,#f97316,#ef4444)", icon: <CheckCircle2 size={16} />, color: "#f97316" },
  ];

  return (
    <DashboardLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">

        {/* TOAST NOTIFICATION */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-white text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg,#10b981,#06b6d4)",
                boxShadow: "0 0 30px rgba(16,185,129,0.4)"
              }}
            >
              <CheckCircle2 size={16} />
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATUS CARDS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statusCards.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3 }}
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${s.color}22`,
                boxShadow: `0 0 24px ${s.color}11`
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl text-white" style={{ background: s.gradient }}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>{s.label}</p>
                  <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* HEADER */}
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1
                className="text-3xl font-black"
                style={{ background: "linear-gradient(to right,#22d3ee,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                Settings
              </h1>
              <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>
                Personalize your AI learning ecosystem
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}
            >
              <Sparkles size={14} style={{ color: "#06b6d4" }} />
              <span className="text-xs font-medium" style={{ color: "#06b6d4" }}>AI Personalization Active</span>
            </div>
          </div>
        </Card>

        {/* MAIN GRID */}
        <div className="grid xl:grid-cols-2 gap-5">

          {/* AI PREFERENCES */}
          <Card gradient="linear-gradient(135deg,#06b6d4,#3b82f6)">
            <SectionHeader
              icon={<Brain size={18} />}
              title="AI Preferences"
              subtitle="Configure AI behavior"
              gradient="linear-gradient(135deg,#06b6d4,#3b82f6)"
            />
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "rgba(148,163,184,0.7)" }}>AI TONE</label>
                <StyledSelect
                  value={settings?.aiTone || "Academic"}
                  onChange={v => { update("aiTone", v); playClick(); }}
                  options={["Academic", "Exam Focused", "Beginner Friendly", "Concise", "Socratic"]}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "rgba(148,163,184,0.7)" }}>RESPONSE LENGTH</label>
                <StyledSelect
                  value={settings?.responseLength || "Medium"}
                  onChange={v => { update("responseLength", v); playClick(); }}
                  options={["Short", "Medium", "Detailed", "Comprehensive"]}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "rgba(148,163,184,0.7)" }}>LANGUAGE</label>
                <StyledSelect
                  value={settings?.language || "English"}
                  onChange={v => { update("language", v); playClick(); }}
                  options={["English", "Urdu", "Arabic", "French", "Spanish"]}
                />
              </div>
              <Row label="Streaming Responses" sublabel="Real-time AI typing effect">
                <Toggle value={!!settings?.streaming} onChange={v => { update("streaming", v); playClick(); }} color="#06b6d4" />
              </Row>
            </div>
          </Card>

          {/* APPEARANCE */}
          <Card gradient="linear-gradient(135deg,#a855f7,#ec4899)">
            <SectionHeader
              icon={<Palette size={18} />}
              title="Appearance"
              subtitle="Customize dashboard visuals"
              gradient="linear-gradient(135deg,#a855f7,#ec4899)"
            />
            <div className="space-y-4">
              <Row label="Dark Mode" sublabel="Futuristic dark UI">
                <div className="flex items-center gap-2">
                  <Sun size={14} style={{ color: "rgba(148,163,184,0.4)" }} />
                  <Toggle value={darkMode} onChange={() => { toggleTheme(); playClick(); }} color="#a855f7" />
                  <Moon size={14} style={{ color: darkMode ? "#a855f7" : "rgba(148,163,184,0.4)" }} />
                </div>
              </Row>
              <div>
                <label className="text-xs font-semibold mb-3 block" style={{ color: "rgba(148,163,184,0.7)" }}>ACCENT THEME</label>
                <div className="flex gap-3">
                  {themes.map(t => (
                    <button
                      key={t.name}
                      onClick={() => { update("accent", t.name); playClick(); }}
                      className="w-10 h-10 rounded-full transition-all duration-300"
                      style={{
                        background: t.gradient,
                        transform: settings?.accent === t.name ? "scale(1.2)" : "scale(1)",
                        boxShadow: settings?.accent === t.name ? `0 0 20px rgba(168,85,247,0.5)` : "none",
                        border: settings?.accent === t.name ? "2px solid white" : "2px solid transparent"
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "rgba(148,163,184,0.7)" }}>FONT SIZE</label>
                <StyledSelect
                  value={settings?.fontSize || "Medium"}
                  onChange={v => { update("fontSize", v); playClick(); }}
                  options={["Small", "Medium", "Large", "Extra Large"]}
                />
              </div>
            </div>
          </Card>

          {/* STUDY PREFERENCES */}
          <Card gradient="linear-gradient(135deg,#10b981,#06b6d4)">
            <SectionHeader
              icon={<Target size={18} />}
              title="Study Preferences"
              subtitle="Adaptive AI learning"
              gradient="linear-gradient(135deg,#10b981,#06b6d4)"
            />
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold" style={{ color: "rgba(148,163,184,0.7)" }}>DAILY STUDY GOAL</label>
                  <span className="text-xs font-bold" style={{ color: "#10b981" }}>{settings?.studyGoal || 4}h / day</span>
                </div>
                <input
                  type="range" min="1" max="12"
                  value={settings?.studyGoal || 4}
                  onChange={e => update("studyGoal", Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: "rgba(148,163,184,0.4)" }}>
                  <span>1h</span><span>6h</span><span>12h</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "rgba(148,163,184,0.7)" }}>WEAK SUBJECT</label>
                <StyledSelect
                  value={settings?.weakSubject || "Mathematics"}
                  onChange={v => { update("weakSubject", v); playClick(); }}
                  options={["Mathematics", "Physics", "Biology", "Chemistry", "Computer Science", "English", "Urdu", "History"]}
                />
              </div>
              <Row label="Adaptive Learning" sublabel="AI adapts quizzes to your level">
                <Toggle value={!!settings?.adaptiveLearning} onChange={v => { update("adaptiveLearning", v); playClick(); }} color="#10b981" />
              </Row>
            </div>
          </Card>

          {/* NOTIFICATIONS & PRIVACY */}
          <Card gradient="linear-gradient(135deg,#f97316,#ec4899)">
            <SectionHeader
              icon={<Bell size={18} />}
              title="Notifications & Privacy"
              subtitle="Smart productivity alerts"
              gradient="linear-gradient(135deg,#f97316,#ec4899)"
            />
            <div className="space-y-4">
              <Row label="Smart Notifications" sublabel="AI reminders & streak alerts">
                <Toggle
                  value={!!settings?.notifications}
                  onChange={async v => {
                    if (v && "Notification" in window) {
                      await Notification.requestPermission();
                    }
                    update("notifications", v);
                    playClick();
                  }}
                  color="#f97316"
                />
              </Row>
              <Row label="Sound Effects" sublabel="UI interaction sounds">
                <Toggle value={!!settings?.soundEffects} onChange={v => { update("soundEffects", v); }} color="#f97316" />
              </Row>
              <Row label="Voice Assistant" sublabel="AI voice guidance">
                <div className="flex items-center gap-2">
                  {settings?.voiceAssistant
                    ? <Mic size={14} style={{ color: "#f97316" }} />
                    : <MicOff size={14} style={{ color: "rgba(148,163,184,0.4)" }} />
                  }
                  <Toggle value={!!settings?.voiceAssistant} onChange={v => { update("voiceAssistant", v); playClick(); }} color="#f97316" />
                </div>
              </Row>
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
              >
                <Shield size={16} style={{ color: "#10b981" }} />
                <div>
                  <p className="text-xs font-bold text-white">Privacy & Security</p>
                  <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>End-to-end encrypted · Data never sold</p>
                </div>
                <CheckCircle2 size={14} style={{ color: "#10b981", marginLeft: "auto" }} />
              </div>
            </div>
          </Card>

        </div>

        {/* SAVE / RESET */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(148,163,184,0.7)"
            }}
          >
            <RotateCcw size={15} />
            Reset to Defaults
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300"
            style={{
              background: saved
                ? "linear-gradient(135deg,#10b981,#06b6d4)"
                : "linear-gradient(135deg,#06b6d4,#6366f1,#a855f7)",
              boxShadow: saved
                ? "0 0 30px rgba(16,185,129,0.4)"
                : "0 0 30px rgba(99,102,241,0.35)"
            }}
          >
            {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
            {saved ? "Saved!" : "Save Settings"}
          </motion.button>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Settings;