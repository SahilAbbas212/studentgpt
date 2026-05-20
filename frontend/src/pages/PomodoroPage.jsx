import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import useSessionTracker from "../hooks/useSessionTracker";
import { usePomodoro } from "../context/PomodoroContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaFire, FaCoffee, FaBolt, FaTrophy, FaClock, FaPlay, FaPause, FaRedo } from "react-icons/fa";

const motivationalMessages = {
  Study: [
    "🔥 Lock in. This session defines your future.",
    "⚡ Deep work mode activated. Distractions are the enemy.",
    "🎯 Every minute of focus is an investment in yourself.",
    "🧠 Your brain is building neural pathways right now.",
    "💎 Champions are built in sessions like this.",
  ],
  Break: [
    "✨ Rest is productive. Your brain is consolidating memories.",
    "🌊 Breathe. You earned this break.",
    "💪 Recharge and come back stronger.",
    "🎯 Great work. Now recover fully.",
    "🌟 Rest is part of the winning strategy.",
  ],
};

export default function PomodoroPage() {
  useSessionTracker("Pomodoro");

  const {
    studyMinutes, setStudyMinutes,
    breakMinutes, setBreakMinutes,
    timeLeft, setTimeLeft,
    isRunning, mode, task, setTask,
    sessions, startTimer, pauseTimer, resetTimer,
  } = usePomodoro();

  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % motivationalMessages[mode].length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mode]);

  const total = mode === "Study" ? studyMinutes * 60 : breakMinutes * 60;
  const progress = ((total - timeLeft) / total) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const productivity = sessions > 0
    ? Math.min(100, Math.round((sessions * studyMinutes) / ((sessions * studyMinutes) + 10) * 100) + 72)
    : 92;

  const isStudy = mode === "Study";

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6 md:p-10 bg-slate-50 dark:bg-transparent transition-colors duration-300">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-sm font-bold mb-4">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            DEEP WORK PRODUCTIVITY SYSTEM
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-transparent bg-clip-text">
            Focus Mode
          </h1>
        </motion.div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">

          {/* LEFT — SETTINGS */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 flex flex-col gap-5"
          >

            {/* TASK INPUT */}
            <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 mb-4">
                <FaBolt className="text-yellow-500" />
                <span className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                  Current Task
                </span>
              </div>
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Complete Physics Revision..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-cyan-500 dark:focus:border-cyan-500/50 transition-all text-sm"
              />
            </div>

            {/* SLIDERS */}
            <div className="rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">

              {/* STUDY */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black tracking-widest text-cyan-600 dark:text-cyan-400 uppercase">
                    Study Minutes
                  </span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-black text-lg">
                    {studyMinutes} min
                  </span>
                </div>
                <input
                  type="range" min={5} max={120} value={studyMinutes}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setStudyMinutes(v);
                    if (!isRunning && mode === "Study") setTimeLeft(v * 60);
                  }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #06b6d4 ${(studyMinutes / 120) * 100}%, #e2e8f0 0%)` }}
                />
              </div>

              {/* BREAK */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black tracking-widest text-purple-600 dark:text-purple-400 uppercase">
                    Break Minutes
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-black text-lg">
                    {breakMinutes} min
                  </span>
                </div>
                <input
                  type="range" min={1} max={30} value={breakMinutes}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setBreakMinutes(v);
                    if (!isRunning && mode === "Break") setTimeLeft(v * 60);
                  }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #a855f7 ${(breakMinutes / 30) * 100}%, #e2e8f0 0%)` }}
                />
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <FaTrophy />, value: sessions, label: "Sessions", color: "text-yellow-500 dark:text-yellow-400" },
                { icon: <FaClock />, value: `${sessions * studyMinutes}`, label: "Focus Min", color: "text-cyan-600 dark:text-cyan-400" },
                { icon: <FaFire />, value: `${productivity}%`, label: "Productivity", color: "text-orange-500 dark:text-orange-400" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-2xl p-4 text-center bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none"
                >
                  <div className={`text-lg mb-1 flex justify-center ${s.color}`}>{s.icon}</div>
                  <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-slate-400 dark:text-slate-500 text-xs mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>

          </motion.div>

          {/* CENTER — TIMER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div
              className="rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-none"
              style={{
                boxShadow: isStudy
                  ? "0 0 60px rgba(34,211,238,0.08)"
                  : "0 0 60px rgba(168,85,247,0.08)"
              }}
            >
              {/* TOP ACCENT */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{
                  background: isStudy
                    ? "linear-gradient(90deg, transparent, #06b6d4, transparent)"
                    : "linear-gradient(90deg, transparent, #a855f7, transparent)"
                }}
              />

              {/* MODE BADGE */}
              <div className="flex justify-center mb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full border font-black text-sm ${
                      isStudy
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
                        : "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {isStudy ? <FaFire /> : <FaCoffee />}
                    {mode} Mode
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* CIRCULAR TIMER */}
              <div className="flex justify-center mb-8">
                <div className="relative w-72 h-72 flex items-center justify-center">

                  {/* BG GLOW */}
                  <div
                    className="absolute inset-0 rounded-full blur-[50px] opacity-10 dark:opacity-20"
                    style={{ background: isStudy ? "#06b6d4" : "#a855f7" }}
                  />

                  {/* SVG RING */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 280 280">
                    <circle
                      cx="140" cy="140" r="120"
                      fill="none"
                      stroke="rgba(100,100,100,0.1)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="140" cy="140" r="120"
                      fill="none"
                      stroke={isStudy ? "#06b6d4" : "#a855f7"}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{ filter: `drop-shadow(0 0 8px ${isStudy ? "#06b6d4" : "#a855f7"})` }}
                      transition={{ duration: 0.5 }}
                    />
                    <circle
                      cx="140" cy="140" r="132"
                      fill="none"
                      stroke="rgba(100,100,100,0.05)"
                      strokeWidth="2"
                    />
                  </svg>

                  {/* TIME DISPLAY */}
                  <div className="relative z-10 text-center">
                    <div
                      className="text-6xl md:text-7xl font-black text-slate-800 dark:text-white"
                      style={{
                        textShadow: isStudy
                          ? "0 0 30px rgba(34,211,238,0.3)"
                          : "0 0 30px rgba(168,85,247,0.3)"
                      }}
                    >
                      {formatTime()}
                    </div>
                    <div className={`text-sm font-bold mt-2 ${isStudy ? "text-cyan-600 dark:text-cyan-400" : "text-purple-600 dark:text-purple-400"}`}>
                      {Math.round(progress)}% complete
                    </div>
                    {task && (
                      <div className="text-slate-400 text-xs mt-1 max-w-[160px] truncate">
                        {task}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* MOTIVATIONAL MESSAGE */}
              <div className="text-center mb-8 min-h-[32px]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={msgIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-slate-500 dark:text-slate-400 text-sm font-medium"
                  >
                    {motivationalMessages[mode][msgIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-center gap-4 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startTimer}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white disabled:opacity-40 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                    boxShadow: "0 0 30px rgba(6,182,212,0.3)"
                  }}
                >
                  <FaPlay /> Start
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pauseTimer}
                  disabled={!isRunning}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white disabled:opacity-40 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #ec4899)",
                    boxShadow: "0 0 30px rgba(168,85,247,0.3)"
                  }}
                >
                  <FaPause /> Pause
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetTimer}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all text-slate-700 dark:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  <FaRedo /> Reset
                </motion.button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </DashboardLayout>
  );
}