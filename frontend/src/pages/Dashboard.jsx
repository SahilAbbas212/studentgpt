import DashboardLayout from "../layouts/DashboardLayout";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  FaBrain, FaClock, FaFire, FaBolt,
  FaBook, FaStickyNote, FaRobot, FaCalendarAlt,
  FaTrophy, FaChartLine, FaStar
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_hours: 0,
    avg_score: 0,
    total_quizzes: 0,
    subject_data: []
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [user, setUser] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState("");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(u);
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("Good Morning");
    else if (hour < 17) setTimeOfDay("Good Afternoon");
    else setTimeOfDay("Good Evening");
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/api/analytics/");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    {
      title: "Generate Notes",
      subtitle: "AI-powered smart notes",
      icon: <FaStickyNote />,
      gradient: "linear-gradient(135deg, #06b6d4, #3b82f6, #6366f1)",
      glow: "rgba(6,182,212,0.25)",
      path: "/notes",
      tag: "POPULAR"
    },
    {
      title: "AI Quiz",
      subtitle: "Interactive MCQ generation",
      icon: <FaBook />,
      gradient: "linear-gradient(135deg, #a855f7, #ec4899, #f43f5e)",
      glow: "rgba(168,85,247,0.25)",
      path: "/quiz",
      tag: "NEW"
    },
    {
      title: "AI Chatbot",
      subtitle: "Ask anything instantly",
      icon: <FaRobot />,
      gradient: "linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)",
      glow: "rgba(16,185,129,0.25)",
      path: "/chatbot",
      tag: "AI"
    },
    {
      title: "Study Planner",
      subtitle: "Smart AI timetable",
      icon: <FaCalendarAlt />,
      gradient: "linear-gradient(135deg, #f97316, #ec4899, #a855f7)",
      glow: "rgba(249,115,22,0.25)",
      path: "/timetable",
      tag: "SMART"
    }
  ];

  const statCards = [
    {
      icon: <FaClock />,
      value: loadingStats ? "..." : `${stats.total_hours}h`,
      label: "Study Hours",
      sub: "Total logged time",
      color: "text-cyan-500 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
      border: "border-cyan-200 dark:border-cyan-500/20",
      dot: "bg-cyan-500",
    },
    {
      icon: <FaBrain />,
      value: loadingStats ? "..." : `${stats.avg_score}%`,
      label: "Avg Quiz Score",
      sub: "Performance rating",
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-200 dark:border-purple-500/20",
      dot: "bg-purple-500",
    },
    {
      icon: <FaFire />,
      value: loadingStats ? "..." : stats.total_quizzes,
      label: "Quizzes Taken",
      sub: "Completed sessions",
      color: "text-pink-500 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-500/10",
      border: "border-pink-200 dark:border-pink-500/20",
      dot: "bg-pink-500",
    },
    {
      icon: <FaBolt />,
      value: loadingStats ? "..." : stats.subject_data?.length || 0,
      label: "Subjects Studied",
      sub: "Unique subjects",
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/20",
      dot: "bg-amber-500",
    }
  ];

  const getInsights = () => {
    const insights = [];
    if (stats.avg_score >= 80) {
      insights.push({ icon: "🏆", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-500/10", border: "border-cyan-200 dark:border-cyan-500/20", text: `Great job! Your avg quiz score is ${stats.avg_score}%`, label: "Performance" });
    } else if (stats.avg_score > 0) {
      insights.push({ icon: "📈", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-500/10", border: "border-cyan-200 dark:border-cyan-500/20", text: `Avg quiz score is ${stats.avg_score}% — keep practicing!`, label: "Performance" });
    } else {
      insights.push({ icon: "✅", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-500/10", border: "border-cyan-200 dark:border-cyan-500/20", text: "Take a quiz to start tracking your performance.", label: "Performance" });
    }
    if (stats.total_hours >= 5) {
      insights.push({ icon: "⏱️", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20", text: `You've studied ${stats.total_hours}h total — great consistency!`, label: "Study Time" });
    } else {
      insights.push({ icon: "⏱️", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20", text: `You've logged ${stats.total_hours}h — try to study more daily.`, label: "Study Time" });
    }
    if (stats.total_quizzes >= 3) {
      insights.push({ icon: "🔥", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", text: `${stats.total_quizzes} quizzes completed — you're on a roll!`, label: "Quiz Activity" });
    } else {
      insights.push({ icon: "📝", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", text: `You've taken ${stats.total_quizzes} quiz${stats.total_quizzes !== 1 ? "es" : ""} — try more!`, label: "Quiz Activity" });
    }
    return insights;
  };

  return (
    <DashboardLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 relative overflow-hidden rounded-3xl p-8 md:p-10 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none"
        >
          {/* TOP ACCENT */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

          {/* BG GLOW */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 dark:bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-black tracking-widest mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                AI PRODUCTIVITY SYSTEM ACTIVE
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                {timeOfDay} 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base">
                {user?.username || user?.email || "Student"} — Your AI academic OS is ready.
              </p>
            </div>

            {/* QUICK STATS MINI */}
            <div className="flex gap-4 flex-wrap">
              {[
                { icon: <FaTrophy />, value: `${stats.avg_score}%`, label: "Score", color: "text-yellow-500" },
                { icon: <FaChartLine />, value: `${stats.total_hours}h`, label: "Studied", color: "text-cyan-500" },
                { icon: <FaStar />, value: stats.total_quizzes, label: "Quizzes", color: "text-purple-500" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <span className={`text-lg ${s.color}`}>{s.icon}</span>
                  <div>
                    <div className="font-black text-slate-900 dark:text-white text-lg leading-none">{loadingStats ? "..." : s.value}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`p-5 rounded-2xl border ${card.bg} ${card.border} shadow-sm dark:shadow-none relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 opacity-5 dark:opacity-10 rounded-full blur-2xl pointer-events-none"
                style={{ background: "currentColor" }} />
              <div className="flex items-center justify-between mb-4">
                <span className={`text-2xl ${card.color}`}>{card.icon}</span>
                <div className={`w-2 h-2 rounded-full ${card.dot} animate-pulse`} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                {card.value}
              </h2>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{card.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-amber-500">⚡</span>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Quick Actions</h2>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black">
              4 TOOLS
            </span>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {quickActions.map((item, i) => (
              <motion.button
                key={i}
                onClick={() => navigate(item.path)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                whileHover={{ y: -6, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative overflow-hidden p-5 rounded-2xl text-left cursor-pointer"
                style={{
                  background: item.gradient,
                  boxShadow: `0 8px 32px ${item.glow}`,
                }}
              >
                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />

                {/* TAG */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black tracking-wider">
                  {item.tag}
                </div>

                <div className="relative z-10">
                  <div className="text-2xl text-white mb-4 drop-shadow">{item.icon}</div>
                  <h3 className="text-base font-black text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-white/75">{item.subtitle}</p>
                </div>

                {/* SHINE EFFECT */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* AI INSIGHTS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-6 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-indigo-500/15 shadow-sm dark:shadow-none"
        >
          <div className="flex items-center gap-2 mb-6">
            <span>🧠</span>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">AI Insights</h2>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-black">
              LIVE
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {getInsights().map((insight, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`p-5 rounded-xl border ${insight.bg} ${insight.border} relative overflow-hidden`}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-current opacity-30" />
                <div className={`text-xs font-black tracking-widest mb-2 ${insight.color}`}>
                  {insight.label}
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                    {insight.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;