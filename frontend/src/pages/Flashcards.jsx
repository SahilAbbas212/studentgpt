import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import useSessionTracker from "../hooks/useSessionTracker";
import { generateFlashcards } from "../api/flashcardsApi";
import { uploadFile } from "../api/notesApi";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalState } from "../hooks/useLocalState";
import { FaBolt, FaUpload, FaRedo, FaChevronLeft, FaChevronRight, FaSyncAlt, FaTrophy, FaFire } from "react-icons/fa";

const gradientSets = [
  { from: "#06b6d4", via: "#3b82f6", to: "#8b5cf6" },
  { from: "#ec4899", via: "#a855f7", to: "#6366f1" },
  { from: "#10b981", via: "#06b6d4", to: "#3b82f6" },
  { from: "#f97316", via: "#ec4899", to: "#a855f7" },
  { from: "#6366f1", via: "#8b5cf6", to: "#06b6d4" },
];

function Flashcards() {
  useSessionTracker("Flashcards");

  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState([]);

  const [text, setText] = useLocalState("flashcards_input_text", "");
  const [cards, setCards] = useLocalState("flashcards_data", []);
  const [current, setCurrent] = useLocalState("flashcards_index", 0);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await uploadFile(file);
      setText(data.text);
    } catch {
      alert("Upload failed");
    }
  };

  const handleGenerate = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const data = await generateFlashcards(text);
      const rawCards = data.flashcards.split("Q:").filter(Boolean);
      const formattedCards = rawCards.map((card) => {
        const parts = card.split("A:");
        return { question: parts[0]?.trim(), answer: parts[1]?.trim() };
      });
      setCards(formattedCards);
      setCurrent(0);
      setFlipped(false);
      setMastered([]);
    } catch (error) {
      alert("Generation failed: " + (error?.response?.data?.detail || error?.message || "Unknown error"));
    }
    setLoading(false);
  };

  const handleReset = () => {
    setCards([]);
    setCurrent(0);
    setText("");
    setFlipped(false);
    setMastered([]);
  };

  const handleMastered = () => {
    if (!mastered.includes(current)) {
      setMastered([...mastered, current]);
    }
    if (current < cards.length - 1) {
      setCurrent(current + 1);
      setFlipped(false);
    }
  };

  const currentCard = cards[current];
  const gradient = gradientSets[current % gradientSets.length];
  const progress = cards.length > 0 ? ((current + 1) / cards.length) * 100 : 0;
  const isMastered = mastered.includes(current);

  return (
    <DashboardLayout>
      <div className="relative max-w-5xl mx-auto px-6 py-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-black tracking-widest mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                AI POWERED STUDY CARDS
              </div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-transparent bg-clip-text leading-tight">
                AI Flashcards
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg mt-2">
                Learn smarter with premium AI study cards
              </p>
            </div>

            {/* STATS */}
            <div className="flex gap-3 flex-wrap items-center">
              <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm text-center min-w-[80px]">
                <div className="text-xs font-black tracking-widest text-slate-400 uppercase mb-1">Cards</div>
                <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{cards.length}</div>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm text-center min-w-[80px]">
                <div className="text-xs font-black tracking-widest text-slate-400 uppercase mb-1">Progress</div>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {cards.length > 0 ? Math.round(progress) : 0}%
                </div>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm text-center min-w-[80px]">
                <div className="text-xs font-black tracking-widest text-slate-400 uppercase mb-1">Mastered</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{mastered.length}</div>
              </div>
              {cards.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/30 hover:text-red-500 transition-all"
                >
                  <FaRedo className="text-xs" /> Clear
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* INPUT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

          {/* FILE UPLOAD */}
          <div className="mb-6">
            <label className="flex items-center gap-3 w-fit px-5 py-3 rounded-2xl cursor-pointer font-black text-sm transition-all bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400">
              <FaUpload className="text-cyan-500" />
              Upload File (PDF/DOCX/TXT)
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* TEXTAREA */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Upload a file or paste your study material here..."
            className="w-full h-44 rounded-2xl p-5 outline-none resize-none text-base transition-all bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-cyan-500 dark:focus:border-cyan-500/50 mb-6"
          />

          {/* GENERATE BUTTON */}
          <motion.button
            onClick={handleGenerate}
            disabled={loading || !text.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-black text-white disabled:opacity-50 transition-all"
            style={{
              background: "linear-gradient(135deg, #a855f7, #06b6d4, #3b82f6)",
              boxShadow: "0 0 40px rgba(168,85,247,0.25)"
            }}
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                />
                Generating Flashcards...
              </>
            ) : (
              <>
                <FaBolt /> Generate Premium Flashcards
              </>
            )}
          </motion.button>
        </motion.div>

        {/* LOADING STATE */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="text-cyan-600 dark:text-cyan-400 text-xl font-black animate-pulse">
                ⚡ AI is crafting your premium flashcards...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FLASHCARD */}
        <AnimatePresence>
          {cards.length > 0 && currentCard && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >

              {/* CARD COUNTER */}
              <div className="flex items-center gap-2 mb-6">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrent(i); setFlipped(false); }}
                    className={`rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-8 h-2.5 bg-cyan-500"
                        : mastered.includes(i)
                        ? "w-2.5 h-2.5 bg-emerald-500"
                        : "w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                ))}
              </div>

              {/* MAIN CARD */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => setFlipped(!flipped)}
                className="relative w-full max-w-3xl rounded-[2.5rem] overflow-hidden cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`,
                  boxShadow: `0 20px 60px ${gradient.from}40`,
                  minHeight: "380px"
                }}
              >
                {/* OVERLAYS */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/30" />

                {/* BADGES */}
                <div className="absolute top-5 left-5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white/80 text-xs font-black border border-white/20">
                  {current + 1} / {cards.length}
                </div>
                <div className="absolute top-5 right-5 flex items-center gap-2">
                  {isMastered && (
                    <div className="px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                      ✓ MASTERED
                    </div>
                  )}
                  <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white/80 text-xs font-black border border-white/20">
                    AI CARD
                  </div>
                </div>

                {/* CONTENT */}
                <div className="relative z-10 flex flex-col justify-center items-center min-h-[380px] p-12 text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${current}-${flipped}`}
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-white/60 uppercase tracking-[0.4em] text-xs font-black mb-6">
                        {flipped ? "✅ Answer" : "❓ Question"}
                      </div>
                      <div className="text-white text-2xl md:text-3xl font-black leading-relaxed max-h-[220px] overflow-y-auto">
                        {flipped ? currentCard.answer : currentCard.question}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <div className="mt-10 text-white/40 text-sm">
                    ✨ Tap card to flip
                  </div>
                </div>
              </motion.div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 mt-8 flex-wrap justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setCurrent(Math.max(current - 1, 0)); setFlipped(false); }}
                  disabled={current === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white disabled:opacity-40 transition-all"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  <FaChevronLeft /> Previous
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFlipped(!flipped)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}
                >
                  <FaSyncAlt /> Flip Card
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMastered}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  <FaTrophy /> Got It
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setCurrent(Math.min(current + 1, cards.length - 1)); setFlipped(false); }}
                  disabled={current === cards.length - 1}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white disabled:opacity-40 transition-all"
                  style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
                >
                  Next <FaChevronRight />
                </motion.button>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-black text-slate-500 dark:text-slate-400">Progress</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                      <FaFire /> {mastered.length} mastered
                    </span>
                    <span className="text-sm font-black text-slate-500 dark:text-slate-400">
                      {current + 1} / {cards.length}
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6, #a855f7)" }}
                  />
                </div>
                {/* MASTERY BAR */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-2">
                  <motion.div
                    animate={{ width: `${(mastered.length / cards.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-400">Current position</span>
                  <span className="text-xs text-emerald-500 font-bold">Mastery</span>
                </div>
              </div>

              {/* COMPLETION MESSAGE */}
              {mastered.length === cards.length && cards.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 p-6 rounded-3xl text-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                >
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                    All Cards Mastered!
                  </h3>
                  <p className="text-emerald-600/70 dark:text-emerald-400/70 text-sm">
                    Outstanding work! You've mastered all {cards.length} flashcards.
                  </p>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}

export default Flashcards;