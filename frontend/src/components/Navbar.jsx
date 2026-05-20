import { useTheme } from "../context/ThemeContext";
import { FaMoon, FaSun } from "react-icons/fa";
import { motion } from "framer-motion";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="relative z-50 flex justify-between items-center px-8 py-5 border-b border-white/10 backdrop-blur-2xl bg-black/10">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        <div>
          <h2 className="text-slate-900 dark:text-white text-xl font-black">
            AI Online
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Productivity System Active
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">

        {/* Notification Bell */}
        <NotificationBell />

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.12, rotate: 8 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="relative w-14 h-14 rounded-full flex items-center justify-center border border-white/10 bg-white/10 backdrop-blur-xl text-white shadow-[0_0_30px_rgba(59,130,246,0.25)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20" />
          <div className="relative z-10">
            {darkMode
              ? <FaSun className="text-yellow-300 text-2xl drop-shadow-lg" />
              : <FaMoon className="text-cyan-300 text-2xl drop-shadow-lg" />
            }
          </div>
        </motion.button>

      </div>
    </div>
  );
}

export default Navbar;