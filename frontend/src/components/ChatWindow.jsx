import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../api/chatbotApi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useLocalState } from "../hooks/useLocalState";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = {
  violet: "#7C3AED",
  amber:  "#F59E0B",
  rose:   "#F43F5E",
  teal:   "#14B8A6",
};

function ChatWindow() {
  const [question, setQuestion]         = useState("");
  const [messages, setMessages]         = useLocalState("chatbot_messages", []);
  const [loading, setLoading]           = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [exportingIndex, setExportingIndex] = useState(null);
  const [copied, setCopied]             = useState(null);
  const answerRefs  = useRef({});
  const utterancesRef = useRef([]);
  const bottomRef   = useRef();
  const inputRef    = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const cleanTextForSpeech = (text) =>
    text
      .replace(/#{1,6}\s*/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/[-*+]\s+/g, "")
      .replace(/\?+/g, ".")
      .replace(/!+/g, ".")
      .replace(/:{1,}/g, ",")
      .replace(/\(.*?\)/g, "")
      .replace(/[""'']/g, "")
      .replace(/[^\w\s.,]/g, " ")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

  const handleSpeak = (text, index) => {
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      utterancesRef.current = [];
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    utterancesRef.current = [];
    setSpeakingIndex(null);
    const cleaned   = cleanTextForSpeech(text);
    const sentences = cleaned.match(/[^.!?]+[.!?]*/g) || [cleaned];
    let currentIndex = 0;
    setSpeakingIndex(index);
    const speakNext = () => {
      if (currentIndex >= sentences.length) { setSpeakingIndex(null); return; }
      const sentence = sentences[currentIndex].trim();
      if (!sentence) { currentIndex++; speakNext(); return; }
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => { currentIndex++; speakNext(); };
      utterance.onerror = (e) => {
        if (e.error !== "interrupted") console.error("Speech error:", e.error);
        setSpeakingIndex(null);
      };
      utterancesRef.current.push(utterance);
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExportPDF = async (index) => {
    setExportingIndex(index);
    await new Promise(r => setTimeout(r, 150));
    const element = answerRefs.current[index];
    if (!element) { setExportingIndex(null); return; }
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#0f0a1e", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth  = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`StudentGPT-Answer-${index + 1}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExportingIndex(null);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    const currentQuestion = question;
    setLoading(true);
    setQuestion("");
    try {
      const data = await askQuestion(currentQuestion);
      const answer = data?.answer || data?.response || data?.message || "Sorry, I couldn't generate an answer.";
      setMessages(prev => [...prev, { question: currentQuestion, answer }]);
    } catch {
      setMessages(prev => [...prev, { question: currentQuestion, answer: "❌ Error connecting to AI. Please try again." }]);
    }
    setLoading(false);
  };

  const suggestedQuestions = [
    "Explain quantum mechanics simply",
    "What is the Pythagorean theorem?",
    "How does photosynthesis work?",
    "Explain Newton's laws of motion",
  ];

  return (
    <div className="flex flex-col h-full min-h-[85vh] max-w-4xl mx-auto">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 flex-wrap gap-4"
      >
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-1"
            style={{ color: ACCENT.violet }}>
            ✦ AI Assistant
          </p>
          <h1 className="text-4xl font-black"
            style={{
              background: `linear-gradient(135deg, ${ACCENT.violet} 0%, ${ACCENT.rose} 50%, ${ACCENT.amber} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
            Study Chatbot
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Ask anything — get instant, detailed academic answers
          </p>
        </div>
        {messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMessages([])}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#F87171"
            }}
          >
            🗑 Clear Chat
          </motion.button>
        )}
      </motion.div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 space-y-6 mb-6 overflow-y-auto pr-1">

        {/* Empty state with suggestions */}
        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-6"
          >
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
              style={{
                background: `linear-gradient(135deg, ${ACCENT.violet}22, ${ACCENT.rose}22)`,
                border: `1px solid ${ACCENT.violet}33`,
              }}>
              🤖
            </div>
            <div className="text-center">
              <p className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                What would you like to learn?
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Ask any academic question and get instant AI-powered answers
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {suggestedQuestions.map((q, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setQuestion(q); inputRef.current?.focus(); }}
                  className="px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-all"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)",
                  }}
                >
                  💡 {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
          >
            {/* Question bubble */}
            <div className="px-8 py-5 flex items-start gap-4"
              style={{
                background: `linear-gradient(135deg, ${ACCENT.violet}10, ${ACCENT.rose}08)`,
                borderBottom: "1px solid var(--border-subtle)",
              }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 font-bold"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT.violet}, ${ACCENT.rose})`,
                  color: "white",
                }}>
                Q
              </div>
              <p className="font-semibold text-sm pt-1.5 leading-relaxed"
                style={{ color: "var(--text-primary)" }}>
                {msg.question}
              </p>
            </div>

            {/* Answer */}
            <div
              ref={el => (answerRefs.current[index] = el)}
              className="px-8 py-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT.amber}, ${ACCENT.teal})`,
                  }}>
                  🤖
                </div>
                <span className="text-xs font-bold tracking-wide uppercase"
                  style={{ color: ACCENT.amber }}>
                  AI Answer
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold ml-1"
                  style={{ background: `${ACCENT.amber}18`, color: ACCENT.amber }}>
                  #{index + 1}
                </span>
              </div>

              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1 style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      background: `linear-gradient(135deg, ${ACCENT.violet}, ${ACCENT.amber})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      marginBottom: "1rem",
                      marginTop: "1.5rem",
                    }} {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 style={{
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: ACCENT.rose,
                      borderLeft: `3px solid ${ACCENT.rose}`,
                      paddingLeft: "0.875rem",
                      marginTop: "1.5rem",
                      marginBottom: "0.75rem",
                      background: `${ACCENT.rose}08`,
                      borderRadius: "0 8px 8px 0",
                      padding: "0.5rem 0.875rem",
                    }} {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: ACCENT.amber,
                      marginTop: "1.25rem",
                      marginBottom: "0.5rem",
                    }} {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p style={{
                      color: "var(--text-secondary)",
                      lineHeight: 1.9,
                      marginBottom: "0.875rem",
                      fontSize: "0.9rem",
                    }} {...props} />
                  ),
                  strong: ({ ...props }) => (
                    <strong style={{ color: "var(--text-primary)", fontWeight: 700 }} {...props} />
                  ),
                  li: ({ ...props }) => (
                    <li style={{
                      color: "var(--text-secondary)",
                      marginBottom: "0.4rem",
                      lineHeight: 1.8,
                      fontSize: "0.9rem",
                    }} {...props} />
                  ),
                  code: ({ ...props }) => (
                    <code style={{
                      background: `${ACCENT.violet}15`,
                      color: "#A78BFA",
                      padding: "2px 7px",
                      borderRadius: "5px",
                      fontSize: "0.85em",
                      fontFamily: "monospace",
                    }} {...props} />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote style={{
                      borderLeft: `3px solid ${ACCENT.teal}`,
                      paddingLeft: "1rem",
                      margin: "1rem 0",
                      background: `${ACCENT.teal}08`,
                      borderRadius: "0 10px 10px 0",
                      padding: "0.875rem 1rem",
                      color: ACCENT.teal,
                      fontStyle: "italic",
                    }} {...props} />
                  ),
                  hr: () => (
                    <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)", margin: "1.5rem 0" }} />
                  ),
                }}
              >
                {msg.answer}
              </ReactMarkdown>
            </div>

            {/* Action bar */}
            <div className="px-8 py-4 flex items-center gap-2 flex-wrap"
              style={{ borderTop: "1px solid var(--border-subtle)" }}>

              <button
                onClick={() => handleSpeak(msg.answer, index)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: speakingIndex === index
                    ? "rgba(239,68,68,0.1)"
                    : `${ACCENT.violet}10`,
                  border: `1px solid ${speakingIndex === index ? "rgba(239,68,68,0.3)" : `${ACCENT.violet}30`}`,
                  color: speakingIndex === index ? "#F87171" : ACCENT.violet,
                }}
              >
                {speakingIndex === index ? "⏹ Stop" : "🔊 Speak"}
              </button>

              <button
                onClick={() => handleCopy(msg.answer, index)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: copied === index ? `${ACCENT.teal}12` : `${ACCENT.teal}08`,
                  border: `1px solid ${ACCENT.teal}30`,
                  color: copied === index ? ACCENT.teal : "var(--text-muted)",
                }}
              >
                {copied === index ? "✓ Copied!" : "📋 Copy"}
              </button>

              <button
                onClick={() => handleExportPDF(index)}
                disabled={exportingIndex === index}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                style={{
                  background: `${ACCENT.amber}10`,
                  border: `1px solid ${ACCENT.amber}30`,
                  color: ACCENT.amber,
                }}
              >
                {exportingIndex === index ? "⏳ Exporting..." : "📄 Export PDF"}
              </button>

              <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Loading bubble */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                maxWidth: "200px",
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{ background: `linear-gradient(135deg, ${ACCENT.violet}, ${ACCENT.rose})` }}>
                🤖
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: ACCENT.violet }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl p-4"
        style={{
          background: "var(--bg-card)",
          border: `1px solid var(--border-default)`,
          boxShadow: `0 0 40px ${ACCENT.violet}15`,
        }}
      >
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Ask any academic question... (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="flex-1 resize-none outline-none text-sm rounded-2xl px-5 py-3.5 transition-all"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              lineHeight: 1.7,
            }}
            onFocus={e => e.target.style.borderColor = ACCENT.violet}
            onBlur={e => e.target.style.borderColor = "var(--border-default)"}
          />
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${ACCENT.violet}, ${ACCENT.rose})`,
              boxShadow: loading ? "none" : `0 6px 24px ${ACCENT.violet}50`,
            }}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Send ↑</span>
            )}
          </motion.button>
        </div>
        <p className="text-xs mt-2 px-1" style={{ color: "var(--text-muted)" }}>
          Press Enter to send · Shift+Enter for new line · {messages.length} message{messages.length !== 1 ? "s" : ""} in history
        </p>
      </motion.div>

    </div>
  );
}

export default ChatWindow;