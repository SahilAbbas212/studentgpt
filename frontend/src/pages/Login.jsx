import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash, FaRobot, FaBrain, FaBolt, FaBookOpen, FaTrophy, FaFire } from "react-icons/fa";
import { loginUser } from "../api/authApi";

const quotes = [
  { text: "Discipline creates freedom. Every focused session builds the future version of you.", author: "StudentGPT AI" },
  { text: "Focus is your competitive advantage in a distracted world.", author: "Deep Work" },
  { text: "Small progress every day creates extraordinary results.", author: "Atomic Habits" },
  { text: "Your future self is watching every decision you make today.", author: "StudentGPT AI" },
  { text: "Consistency beats motivation when building greatness.", author: "StudentGPT AI" },
  { text: "The best students master focus, not just information.", author: "StudentGPT AI" },
  { text: "Deep work creates exceptional students.", author: "Cal Newport" },
  { text: "Success is built one productive session at a time.", author: "StudentGPT AI" },
];

const features = [
  { icon: <FaBrain />, label: "AI Smart Notes", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  { icon: <FaRobot />, label: "AI Study Assistant", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  { icon: <FaBolt />, label: "Focus Analytics", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  { icon: <FaBookOpen />, label: "AI Productivity System", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/30" },
  { icon: <FaTrophy />, label: "Quiz Generator", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { icon: <FaFire />, label: "Pomodoro Timer", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
];

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (error) {
      alert("Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-[#020617]">

      {/* ANIMATED PARTICLES */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* GLOW ORBS */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-cyan-500/15 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[700px] h-[700px] bg-purple-600/15 blur-[180px] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />

      {/* GRID OVERLAY */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl grid lg:grid-cols-2 gap-12 px-6 py-10">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col justify-center"
        >
          {/* BADGE */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-bold mb-8 w-fit"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AI POWERED ACADEMIC OS
          </motion.div>

          {/* TITLE */}
          <motion.h1
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl xl:text-9xl tracking-tight font-black leading-none mb-6"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-transparent bg-clip-text">
              Student
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text">
              GPT
            </span>
          </motion.h1>

          {/* SUBTITLE */}
          <p className="text-xl leading-relaxed text-slate-400 max-w-lg mb-10">
            The most advanced AI academic productivity system. Built for students who refuse to be average.
          </p>

          {/* FEATURES GRID */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${f.bg} border ${f.border} cursor-default`}
              >
                <span className={`text-lg ${f.color}`}>{f.icon}</span>
                <span className="text-slate-300 text-sm font-semibold">{f.label}</span>
              </motion.div>
            ))}
          </div>

          {/* QUOTE CARD */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl p-8 border border-white/10"
            style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(168,85,247,0.08))" }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

            <div className="flex items-center gap-2 mb-4">
              <FaBolt className="text-yellow-400 text-lg" />
              <span className="text-yellow-400 font-black text-sm tracking-widest">DAILY MOTIVATION</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xl leading-relaxed text-white font-semibold italic mb-3">
                  "{quotes[quoteIndex].text}"
                </p>
                <p className="text-cyan-400 text-sm font-bold">— {quotes[quoteIndex].author}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2 mt-6">
              {quotes.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${i === quoteIndex ? "w-8 bg-cyan-400" : "w-2 bg-white/20"}`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE — LOGIN FORM */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="relative overflow-hidden rounded-[2.5rem] p-10 border border-white/10 max-w-xl mx-auto w-full"
          style={{ background: "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(2,6,23,0.98))", boxShadow: "0 0 100px rgba(34,211,238,0.12), 0 0 40px rgba(168,85,247,0.08), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          {/* TOP ACCENT LINE */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

          {/* INTERNAL GLOWS */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/8 blur-[100px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/8 blur-[100px] rounded-full" />

          <div className="relative z-10">

            {/* MOBILE TITLE */}
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-transparent bg-clip-text">
                StudentGPT
              </h1>
            </div>

            {/* HEADER */}
            <div className="mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl mb-6 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
              >
                🎓
              </motion.div>

              <h2 className="text-5xl font-black text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-slate-400 text-lg">
                Continue your AI learning journey.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="flex flex-col gap-6">

              {/* EMAIL */}
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block tracking-widest uppercase">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-cyan-500/60 focus:bg-cyan-500/5 transition-all duration-300 text-lg"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block tracking-widest uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-purple-500/60 focus:bg-purple-500/5 transition-all duration-300 text-lg pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="relative overflow-hidden py-5 rounded-2xl text-xl font-black text-white disabled:opacity-70 transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6, #a855f7)", boxShadow: "0 0 40px rgba(59,130,246,0.4)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                    />
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <span>→</span>
                  </span>
                )}
              </motion.button>

            </form>

            {/* DIVIDER */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-slate-600 text-sm">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { value: "10K+", label: "Students" },
                { value: "98%", label: "Satisfaction" },
                { value: "AI", label: "Powered" },
              ].map((s, i) => (
                <div key={i} className="text-center p-3 rounded-2xl bg-white/3 border border-white/5">
                  <div className="text-lg font-black text-cyan-400">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* REGISTER LINK */}
            <p className="text-center text-slate-500 text-base">
              Don't have an account?{" "}
              <Link to="/register" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
                Create Account
              </Link>
            </p>

          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default Login;