import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import useSessionTracker from "../hooks/useSessionTracker";
import { generateTimetable, saveTimetable, getSavedTimetable } from "../api/timetableApi";
import { FaBrain, FaClock, FaBolt, FaFire, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNotifications } from "../context/NotificationContext";

function Timetable() {
  const { scheduleSessionReminders, requestPermission } = useNotifications();
  useSessionTracker("Timetable");

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [customSubject, setCustomSubject] = useState("");
  const [hours, setHours] = useState(4);
  const [goal, setGoal] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [routine, setRoutine] = useState("");
  const [preferences, setPreferences] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [saveMsg, setSaveMsg] = useState("");

  const subjectsList = ["Math", "Physics", "Chemistry", "Biology", "English", "Computer", "Urdu", "History"];
  const preferenceOptions = ["Daily Revision", "Focus Weak Subjects", "Pomodoro Study", "Weekend Intensive", "Include Breaks"];

  // Load saved timetable when page opens
 useEffect(() => {
    const loadSaved = async () => {
      try {
        const data = await getSavedTimetable();
        if (data.timetable && data.timetable.length > 0) {
          setTimetable(data.timetable);
          setTotalDays(data.timetable.length);
          await requestPermission();
          scheduleSessionReminders({ week: buildWeekMap(data.timetable) });
        }
      } catch (err) {
        console.log("No saved timetable found");
      }
    };
    loadSaved();
  }, []);

  const toggleSubject = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const addCustomSubject = () => {
    if (!customSubject.trim()) return;
    if (!selectedSubjects.includes(customSubject)) {
      setSelectedSubjects([...selectedSubjects, customSubject]);
    }
    setCustomSubject("");
  };

  const togglePreference = (pref) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter(p => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  const handleGenerate = async () => {
    if (selectedSubjects.length === 0 || !goal || !routine) {
      alert("Please complete all planner fields");
      return;
    }

    setLoading(true);
    try {
      const data = await generateTimetable(selectedSubjects, Number(hours), goal, syllabus, routine, preferences);
      const timetableData = data?.timetable || [];
      setTimetable(timetableData);
      setTotalDays(data?.total_days || 7);
      await requestPermission();
      scheduleSessionReminders({ week: buildWeekMap(timetableData) });
    } catch (error) {
      console.log(error);
      alert("Failed to generate timetable");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await saveTimetable(timetable);
      setSaveMsg("✅ Timetable saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg("❌ Save failed");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const handleGenerateNew = () => {
    setTimetable([]);
    setTotalDays(0);
    setSaveMsg("");
  };

  const buildWeekMap = (flat) => {
    const map = {};
    flat.forEach(session => {
      const day = session.day?.trim().toLowerCase();
      if (!day) return;
      if (!map[day]) map[day] = [];
      map[day].push(session);
    });
    return map;
  };

  const days = timetable.length > 0
    ? [...new Set(timetable.map(item => item.day))]
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getSubjectColor = (subject) => {
    subject = subject?.toLowerCase() || "";
    if (subject.includes("math")) return "from-cyan-500 to-blue-500";
    if (subject.includes("physics")) return "from-purple-500 to-pink-500";
    if (subject.includes("chemistry")) return "from-orange-500 to-red-500";
    if (subject.includes("biology")) return "from-green-500 to-emerald-500";
    if (subject.includes("revision")) return "from-yellow-500 to-orange-500";
    if (subject.includes("english")) return "from-teal-500 to-cyan-500";
    if (subject.includes("computer")) return "from-blue-500 to-indigo-500";
    return "from-indigo-500 to-cyan-500";
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toLowerCase() || "";
    if (p === "high") return "text-red-300 bg-red-500/20 px-2 py-0.5 rounded-full";
    if (p === "medium") return "text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded-full";
    return "text-green-300 bg-green-500/20 px-2 py-0.5 rounded-full";
  };

  return (
    <DashboardLayout>
      <div className="relative max-w-[1700px] mx-auto px-6 py-12">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[140px] rounded-full" />

        {/* HERO */}
        <div className="flex justify-between items-center flex-wrap gap-10 mb-16">
          <div>
            <h1 className="text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-transparent bg-clip-text">
              AI Study Planner
            </h1>
            <p className="text-slate-400 text-xl mt-4">Personal AI academic productivity system</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="glass p-6 rounded-3xl text-center">
              <FaClock className="text-cyan-400 text-4xl mx-auto mb-4" />
              <h2 className="text-4xl font-black text-white">42h</h2>
              <p className="text-slate-400">Study Hours</p>
            </div>
            <div className="glass p-6 rounded-3xl text-center">
              <FaBrain className="text-purple-400 text-4xl mx-auto mb-4" />
              <h2 className="text-4xl font-black text-white">92%</h2>
              <p className="text-slate-400">Focus</p>
            </div>
            <div className="glass p-6 rounded-3xl text-center">
              <FaFire className="text-pink-400 text-4xl mx-auto mb-4" />
              <h2 className="text-4xl font-black text-white">14</h2>
              <p className="text-slate-400">Streak</p>
            </div>
            <div className="glass p-6 rounded-3xl text-center">
              <FaBolt className="text-yellow-300 text-4xl mx-auto mb-4" />
              <h2 className="text-4xl font-black text-white">87%</h2>
              <p className="text-slate-400">Productivity</p>
            </div>
          </div>
        </div>

        {/* INPUT PANEL — only show if no timetable loaded */}
        {timetable.length === 0 && (
          <div className="glass border border-cyan-500/20 rounded-[2.5rem] p-10 mb-16 shadow-[0_0_50px_rgba(34,211,238,0.08)]">

            <h2 className="text-3xl font-black text-cyan-400 mb-6">📚 Select Subjects</h2>
            <div className="flex flex-wrap gap-4 mb-8">
              {subjectsList.map((subject, index) => (
                <button
                  key={index}
                  onClick={() => toggleSubject(subject)}
                  className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                    selectedSubjects.includes(subject)
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white scale-105"
                      : "bg-white/5 border border-white/10 text-white hover:bg-cyan-500/10"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>

            <div className="flex gap-4 flex-wrap mb-10">
              <input
                type="text"
                placeholder="Add custom subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSubject()}
                className="input max-w-[320px]"
              />
              <button
                onClick={addCustomSubject}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold hover:scale-105 transition-all flex items-center gap-2"
              >
                <FaPlus /> Add Subject
              </button>
            </div>

            {selectedSubjects.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-12">
                {selectedSubjects.map((subject, index) => (
                  <div
                    key={index}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold flex items-center gap-2"
                  >
                    {subject}
                    <button
                      onClick={() => toggleSubject(subject)}
                      className="text-white/70 hover:text-white text-xs ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <h2 className="text-3xl font-black text-cyan-400 mb-4">⏰ Study Hours Per Day</h2>
            <div className="mb-10">
              <input
                type="range" min="1" max="12" value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full accent-cyan-500"
              />
              <div className="text-white text-xl font-bold mt-3">{hours} Hours Daily</div>
            </div>

            <h2 className="text-3xl font-black text-cyan-400 mb-4">🎯 Study Goal</h2>
            <textarea
              placeholder="e.g. Prepare for final exams in 15 days with daily revision..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="input h-[120px] text-lg mb-10 w-full"
            />

            <h2 className="text-3xl font-black text-cyan-400 mb-2">📖 Syllabus</h2>
            <p className="text-slate-400 text-sm mb-4">List topics per subject — AI will assign them to specific days</p>
            <textarea
              placeholder={`Math: Algebra, Calculus, Trigonometry\nPhysics: Waves, Motion, Thermodynamics\nChemistry: Organic, Bonds, Reactions`}
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              className="input h-[180px] text-lg mb-10 w-full"
            />

            <h2 className="text-3xl font-black text-cyan-400 mb-2">🕒 Daily Routine</h2>
            <p className="text-slate-400 text-sm mb-4">AI will only schedule study in your FREE time slots</p>
            <textarea
              placeholder={`University: 8 AM - 2 PM\nGym: 4 PM - 5 PM\nSleep: 11 PM`}
              value={routine}
              onChange={(e) => setRoutine(e.target.value)}
              className="input h-[160px] text-lg mb-10 w-full"
            />

            <h2 className="text-3xl font-black text-cyan-400 mb-6">⚡ AI Preferences</h2>
            <div className="flex flex-wrap gap-4 mb-10">
              {preferenceOptions.map((pref, index) => (
                <button
                  key={index}
                  onClick={() => togglePreference(pref)}
                  className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                    preferences.includes(pref)
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105"
                      : "bg-white/5 border border-white/10 text-white hover:bg-purple-500/10"
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-4 px-12 py-5 rounded-3xl text-xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:scale-105 transition-all duration-300 text-white shadow-[0_0_40px_rgba(59,130,246,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Generating AI Plan..." : "🚀 Generate AI Study Plan"}
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="text-center text-cyan-400 text-2xl font-bold animate-pulse mb-10">
            🤖 AI is building your personalized study plan...
          </div>
        )}

        {/* CALENDAR */}
        {timetable.length > 0 && (
          <>
            {/* SAVE / NEW BUTTONS */}
            <div className="flex items-center gap-4 mb-8 flex-wrap">
              <button
                onClick={handleSave}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:scale-105 transition-all"
              >
                💾 Save Timetable
              </button>
              <button
                onClick={handleGenerateNew}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold hover:scale-105 transition-all"
              >
                🔄 Generate New
              </button>
              {saveMsg && (
                <span className="text-lg font-bold text-green-400">{saveMsg}</span>
              )}
            </div>

            <h2 className="text-4xl font-black text-white mb-2">
              📅 Your {totalDays}-Day Study Plan
            </h2>
            <p className="text-slate-400 mb-8">{timetable.length} total sessions across {totalDays} days</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {days.map((day, index) => {
                const dayTasks = timetable.filter(item => item.day === day);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.5) }}
                    className="glass min-h-[300px] rounded-[2rem] p-6 border border-white/10"
                  >
                    <h2 className="text-lg font-black text-cyan-400 mb-1">{day}</h2>
                    <p className="text-slate-500 text-xs mb-4">
                      {dayTasks.length} session{dayTasks.length !== 1 ? "s" : ""}
                    </p>
                    <div className="space-y-4">
                      {dayTasks.length > 0 ? (
                        dayTasks.map((task, i) => (
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            key={i}
                            className={`p-4 rounded-2xl bg-gradient-to-r ${getSubjectColor(task.subject)} shadow-xl`}
                          >
                            <h3 className="text-base font-black text-white mb-1">
                              📚 {task.subject}
                            </h3>
                            {task.topic && (
                              <p className="text-white/90 text-xs font-semibold mb-2 bg-black/20 px-2 py-1 rounded-lg">
                                📖 {task.topic}
                              </p>
                            )}
                            <p className="text-white/90 text-xs mb-2 flex items-center gap-1">
                              ⏰ {task.time}
                            </p>
                            <span className={`text-xs font-bold ${getPriorityColor(task.priority)}`}>
                              ⭐ {task.priority}
                            </span>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-slate-500 text-center pt-10 text-sm">
                          🌙 Rest day
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* AI RECOMMENDATIONS */}
        <div className="glass mt-16 p-10 rounded-[2.5rem]">
          <h2 className="text-4xl font-black text-cyan-400 mb-8">🧠 AI Recommendations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-3xl text-white">
              ✅ Revise weak subjects every 2 days
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-3xl text-white">
              ✅ Use Pomodoro for difficult topics
            </div>
            <div className="bg-pink-500/10 border border-pink-500/20 p-6 rounded-3xl text-white">
              ✅ Take 15-minute breaks after long sessions
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


export default Timetable;