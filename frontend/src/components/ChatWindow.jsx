import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../api/chatbotApi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = {
  violet: "#7C3AED",
  amber:  "#F59E0B",
  rose:   "#F43F5E",
  teal:   "#14B8A6",
};

function ChatWindow() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem("chatbot_messages")) || []; }
    catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [exportingIndex, setExportingIndex] = useState(null);
  const [copied, setCopied] = useState(null);
  const answerRefs = useRef({});
  const utterancesRef = useRef([]);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    localStorage.setItem("chatbot_messages", JSON.stringify(messages));
  }, [messages]);

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
    const cleaned = cleanTextForSpeech(text);
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

  // ✅ Pro-level PDF export
  const handleExportPDF = async (index) => {
    setExportingIndex(index);
    await new Promise(r => setTimeout(r, 150));
    const element = answerRefs.current[index];
    if (!element) { setExportingIndex(null); return; }

    try {
      // Save original styles
      const originalBg = element.style.background;
      const originalColor = element.style.color;
      const originalPadding = element.style.padding;

      // Apply white theme for PDF
      element.style.background = "#ffffff";
      element.style.color = "#1e293b";
      element.style.padding = "32px";

      // Fix all child elements for white background
      const allEls = element.querySelectorAll("*");
      const originalStyles = [];
      allEls.forEach(el => {
        originalStyles.push({
          color: el.style.color,
          background: el.style.background,
          textShadow: el.style.textShadow,
          webkitTextFillColor: el.style.webkitTextFillColor,
          borderColor: el.style.borderColor,
        });
        el.style.color = "#1e293b";
        el.style.background = "transparent";
        el.style.textShadow = "none";
        el.style.webkitTextFillColor = "#1e293b";
      });

      // Fix headings
      element.querySelectorAll("h1").forEach(el => {
        el.style.color = "#7C3AED";
        el.style.webkitTextFillColor = "#7C3AED";
      });
      element.querySelectorAll("h2").forEach(el => {
        el.style.color = "#1d4ed8";
        el.style.webkitTextFillColor = "#1d4ed8";
        el.style.borderColor = "#1d4ed8";
        el.style.background = "#eff6ff";
      });
      element.querySelectorAll("h3").forEach(el => {
        el.style.color = "#b45309";
        el.style.webkitTextFillColor = "#b45309";
      });
      element.querySelectorAll("code").forEach(el => {
        el.style.background = "#f1f5f9";
        el.style.color = "#7C3AED";
        el.style.webkitTextFillColor = "#7C3AED";
      });
      element.querySelectorAll("blockquote").forEach(el => {
        el.style.background = "#f0fdf4";
        el.style.color = "#166534";
        el.style.webkitTextFillColor = "#166534";
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      // Restore original styles
      element.style.background = originalBg;
      element.style.color = originalColor;
      element.style.padding = originalPadding;
      allEls.forEach((el, i) => {
        el.style.color = originalStyles[i].color;
        el.style.background = originalStyles[i].background;
        el.style.textShadow = originalStyles[i].textShadow;
        el.style.webkitTextFillColor = originalStyles[i].webkitTextFillColor;
        el.style.borderColor = originalStyles[i].borderColor;
      });

      // Build PDF
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;

      const addHeader = () => {
        // Purple gradient header bar
        pdf.setFillColor(124, 58, 237);
        pdf.rect(0, 0, pageWidth, 18, "F");
        pdf.setFillColor(244, 63, 94);
        pdf.rect(pageWidth * 0.6, 0, pageWidth * 0.4, 18, "F");
        pdf.setFillColor(124, 58, 237);
        pdf.rect(pageWidth * 0.55, 0, pageWidth * 0.1, 18, "F");

        // Header text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text("StudentGPT — AI Study Assistant", margin, 12);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(new Date().toLocaleString(), pageWidth - margin, 12, { align: "right" });
      };

      const addFooter = (pageNum, totalPages) => {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(0, pageHeight - 12, pageWidth, 12, "F");
        pdf.setDrawColor(226, 232, 240);
        pdf.line(0, pageHeight - 12, pageWidth, pageHeight - 12);
        pdf.setTextColor(148, 163, 184);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.text("Generated by StudentGPT AI — Your Academic Productivity OS", margin, pageHeight - 4);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 4, { align: "right" });
      };

      // Calculate pages
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const availableHeight = pageHeight - 18 - 12 - 8; // header + footer + gap
      const totalPages = Math.ceil(imgHeight / availableHeight);

      // Add pages
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        addHeader();

        const sourceY = page * (canvas.height / totalPages);
        const sourceHeight = canvas.height / totalPages;

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sourceHeight;
        const ctx = sliceCanvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);

        pdf.addImage(
          sliceCanvas.toDataURL("image/png"),
          "PNG", margin, 22, imgWidth, availableHeight
        );

        addFooter(page + 1, totalPages);
      }

      // Question label on first page
      pdf.setPage(1);
      pdf.setFillColor(239, 246, 255);
      pdf.roundedRect(margin, 20, contentWidth, 0, 2, 2, "F");

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

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 flex-wrap gap-4"
      >
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-1" style={{ color: ACCENT.violet }}>
            ✦ AI Assistant
          </p>
          <h1 className="text-4xl font-black" style={{
            background: `linear-gradient(135deg, ${ACCENT.violet} 0%, ${ACCENT.rose} 50%, ${ACCENT.amber} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Study Chatbot
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Ask anything — get instant, detailed academic answers
          </p>
        </div>
        {messages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMessages([])}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
          >
            🗑 Clear Chat
          </motion.button>
        )}
      </motion.div>

      {/* MESSAGES */}
      <div className="flex-1 space-y-6 mb-6 overflow-y-auto pr-1">

        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-6"
          >
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
              style={{ background: `linear-gradient(135deg, ${ACCENT.violet}22, ${ACCENT.rose}22)`, border: `1px solid ${ACCENT.violet}33` }}>
              🤖
            </div>
            <div className="text-center">
              <p className="text-xl font-bold mb-2 text-white">What would you like to learn?</p>
              <p className="text-sm text-slate-400">Ask any academic question and get instant AI-powered answers</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {suggestedQuestions.map((q, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setQuestion(q); inputRef.current?.focus(); }}
                  className="px-4 py-3 rounded-2xl text-xs font-semibold text-left transition-all text-slate-300"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  💡 {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
          >
            {/* Question */}
            <div className="px-8 py-5 flex items-start gap-4"
              style={{ background: `linear-gradient(135deg, ${ACCENT.violet}10, ${ACCENT.rose}08)`, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${ACCENT.violet}, ${ACCENT.rose})` }}>
                Q
              </div>
              <p className="font-semibold text-sm pt-1.5 leading-relaxed text-white">{msg.question}</p>
            </div>

            {/* Answer — captured for PDF */}
            <div ref={el => (answerRefs.current[index] = el)} className="px-8 py-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${ACCENT.amber}, ${ACCENT.teal})` }}>
                  🤖
                </div>
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: ACCENT.amber }}>AI Answer</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold ml-1"
                  style={{ background: `${ACCENT.amber}18`, color: ACCENT.amber }}>
                  #{index + 1}
                </span>
              </div>

              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 800, background: `linear-gradient(135deg, ${ACCENT.violet}, ${ACCENT.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "1rem", marginTop: "1.5rem" }} {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: ACCENT.rose, borderLeft: `3px solid ${ACCENT.rose}`, paddingLeft: "0.875rem", marginTop: "1.5rem", marginBottom: "0.75rem", background: `${ACCENT.rose}08`, borderRadius: "0 8px 8px 0", padding: "0.5rem 0.875rem" }} {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: ACCENT.amber, marginTop: "1.25rem", marginBottom: "0.5rem" }} {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p style={{ color: "#cbd5e1", lineHeight: 1.9, marginBottom: "0.875rem", fontSize: "0.9rem" }} {...props} />
                  ),
                  strong: ({ ...props }) => (
                    <strong style={{ color: "white", fontWeight: 700 }} {...props} />
                  ),
                  li: ({ ...props }) => (
                    <li style={{ color: "#cbd5e1", marginBottom: "0.4rem", lineHeight: 1.8, fontSize: "0.9rem" }} {...props} />
                  ),
                  code: ({ ...props }) => (
                    <code style={{ background: `${ACCENT.violet}15`, color: "#A78BFA", padding: "2px 7px", borderRadius: "5px", fontSize: "0.85em", fontFamily: "monospace" }} {...props} />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote style={{ borderLeft: `3px solid ${ACCENT.teal}`, paddingLeft: "1rem", margin: "1rem 0", background: `${ACCENT.teal}08`, borderRadius: "0 10px 10px 0", padding: "0.875rem 1rem", color: ACCENT.teal, fontStyle: "italic" }} {...props} />
                  ),
                  hr: () => (
                    <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "1.5rem 0" }} />
                  ),
                }}
              >
                {msg.answer}
              </ReactMarkdown>
            </div>

            {/* Action bar */}
            <div className="px-8 py-4 flex items-center gap-2 flex-wrap" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => handleSpeak(msg.answer, index)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: speakingIndex === index ? "rgba(239,68,68,0.1)" : `${ACCENT.violet}10`,
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
                  color: copied === index ? ACCENT.teal : "#64748b",
                }}
              >
                {copied === index ? "✓ Copied!" : "📋 Copy"}
              </button>

              <button
                onClick={() => handleExportPDF(index)}
                disabled={exportingIndex === index}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                style={{ background: `${ACCENT.amber}10`, border: `1px solid ${ACCENT.amber}30`, color: ACCENT.amber }}
              >
                {exportingIndex === index ? "⏳ Exporting..." : "📄 Export PDF"}
              </button>

              <span className="ml-auto text-xs text-slate-500">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl"
              style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.08)", maxWidth: "200px" }}
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

      {/* INPUT BAR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl p-4"
        style={{ background: "rgba(15,23,42,0.85)", border: `1px solid rgba(255,255,255,0.08)`, boxShadow: `0 0 40px ${ACCENT.violet}15` }}
      >
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); }
            }}
            placeholder="Ask any academic question... (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="flex-1 resize-none outline-none text-sm rounded-2xl px-5 py-3.5 transition-all text-white"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", lineHeight: 1.7 }}
            onFocus={e => e.target.style.borderColor = ACCENT.violet}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${ACCENT.violet}, ${ACCENT.rose})`, boxShadow: loading ? "none" : `0 6px 24px ${ACCENT.violet}50` }}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Send ↑</span>
            )}
          </motion.button>
        </div>
        <p className="text-xs mt-2 px-1 text-slate-500">
          Press Enter to send · Shift+Enter for new line · {messages.length} message{messages.length !== 1 ? "s" : ""} in history
        </p>
      </motion.div>
    </div>
  );
}

export default ChatWindow;