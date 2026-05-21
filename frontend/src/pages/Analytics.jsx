import { useEffect, useState } from "react";
import API from "../api/axios";
import useSessionTracker from "../hooks/useSessionTracker";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

const COLORS = ["#06b6d4", "#a855f7", "#f59e0b", "#ec4899", "#10b981", "#f97316"];

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-40 opacity-40">
    <p className="text-4xl mb-2">📭</p>
    <p className="text-gray-400 text-sm">{message}</p>
  </div>
);

export default function Analytics() {
  useSessionTracker("Analytics");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get("/analytics/summary", {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});
        setData(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-cyan-400 text-xl animate-pulse">Loading your analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-400 text-xl">Failed to load analytics.</div>
        </div>
      </DashboardLayout>
    );
  }

  const hasWeekly = data.weekly_data?.some((d) => d.hours > 0);
  const hasSubjects = data.subject_data?.length > 0;
  const hasPageTime = data.page_time?.length > 0;
  const hasQuizzes = data.recent_quizzes?.length > 0;

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">

        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
            Your Analytics
          </h1>
          <p className="text-gray-400 mt-1">Real-time study performance dashboard</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🕐", value: `${data.total_hours}h`, label: "Total Study Time" },
            { icon: "📝", value: data.total_quizzes, label: "Quizzes Taken" },
            { icon: "🎯", value: `${data.avg_score}%`, label: "Avg Quiz Score" },
            { icon: "📚", value: data.subject_data?.length || 0, label: "Subjects Studied" },
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-2xl border border-cyan-500/20 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-extrabold text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-2xl border border-cyan-500/20">
            <h2 className="text-xl font-bold text-white mb-4">📈 Weekly Study Hours</h2>
            {hasWeekly ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.weekly_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a4a" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #06b6d4", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="hours" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No study sessions recorded yet. Start using the app!" />
            )}
          </div>

          <div className="glass p-6 rounded-2xl border border-cyan-500/20">
            <h2 className="text-xl font-bold text-white mb-4">🧠 Subject Distribution</h2>
            {hasSubjects ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.subject_data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                    {data.subject_data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #a855f7", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Take quizzes to see subject breakdown." />
            )}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-cyan-500/20">
          <h2 className="text-xl font-bold text-white mb-4">⏱️ Time Spent Per Feature (minutes)</h2>
          {hasPageTime ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.page_time}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a4a" />
                <XAxis dataKey="page" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #06b6d4", borderRadius: 8 }} />
                <Bar dataKey="minutes" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Navigate around the app to track time per feature." />
          )}
        </div>

        <div className="glass p-6 rounded-2xl border border-cyan-500/20">
          <h2 className="text-xl font-bold text-white mb-4">📝 Recent Quiz Results</h2>
          {hasQuizzes ? (
            <div className="space-y-3">
              {data.recent_quizzes.map((q, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-white font-semibold">{q.subject}</p>
                    <p className="text-gray-400 text-sm">{q.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{q.score} / {q.total}</p>
                    <p className={`text-sm font-semibold ${q.percentage >= 70 ? "text-green-400" : q.percentage >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                      {q.percentage}%
                    </p>
                  </div>
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden ml-4">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${q.percentage}%`,
                        background: q.percentage >= 70 ? "#10b981" : q.percentage >= 50 ? "#f59e0b" : "#ef4444"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Complete a quiz to see your results here." />
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}