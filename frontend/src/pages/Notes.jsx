import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DashboardLayout from "../layouts/DashboardLayout";
import useSessionTracker from "../hooks/useSessionTracker";
import { uploadFile, generateNotes } from "../api/notesApi";
import { useLocalState } from "../hooks/useLocalState";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = {
  from:    "#7C3AED",
  to:      "#F59E0B",
  mid:     "#EC4899",
  glow:    "rgba(124,58,237,0.18)",
  border:  "rgba(124,58,237,0.22)",
  dimBg:   "rgba(124,58,237,0.08)",
};

function Notes() {
  useSessionTracker("Notes");

  const [loading, setLoading]   = useState(false);
  const [fileName, setFileName] = useState("");
  const [text, setText]         = useLocalState("notes_input_text", "");
  const [notes, setNotes]       = useLocalState("notes_content", "");
  const fileRef                 = useRef();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const data = await uploadFile(file);
      setText(data.text);
    } catch {
      alert("Upload failed");
    }
  };

  const handleGenerateNotes = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await generateNotes(text);
      setNotes(data.notes);
    } catch {
      alert("Notes generation failed");
    }
    setLoading(false);
  };

  const handleReset = () => { setText(""); setNotes(""); setFileName(""); };

  const exportPDF = async () => {
    const input = document.getElementById("notes-content");
    if (!input) return;
    input.style.background = "white";
    input.style.color = "black";
    input.querySelectorAll("*").forEach((el) => {
      el.style.color = "black";
      el.style.background = "transparent";
      el.style.textShadow = "none";
    });
    const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    pdf.save("StudentGPT-Notes.pdf");
    input.style.background = "";
    input.style.color = "";
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between mb-10 flex-wrap gap-4"
        >
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2"
              style={{ color: "#7C3AED" }}>
              ✦ AI-Powered
            </p>
            <h1 className="text-5xl font-black leading-none"
              style={{
                background: `linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #F59E0B 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
              Smart Notes
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              Transform any material into structured, premium notes
            </p>
          </div>
          {notes && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#F87171"
              }}
            >
              🗑 Clear Notes
            </motion.button>
          )}
        </motion.div>

        {/* ── INPUT CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-8 mb-8"
          style={{
            background: "var(--bg-card)",
            border: `1px solid ${ACCENT.border}`,
            boxShadow: `0 0 60px ${ACCENT.glow}, 0 4px 24px rgba(0,0,0,0.2)`,
          }}
        >
          {/* File upload zone */}
          <div
            onClick={() => fileRef.current.click()}
            className="relative mb-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center py-8 gap-3"
            style={{
              borderColor: fileName ? "#7C3AED" : "rgba(124,58,237,0.25)",
              background: fileName ? "rgba(124,58,237,0.06)" : "var(--bg-surface)",
            }}
          >
            <input ref={fileRef} type="file" onChange={handleFileUpload} className="hidden"
              accept=".pdf,.docx,.pptx,.txt" />
            <div className="text-4xl">{fileName ? "📄" : "☁️"}</div>
            <div className="text-center">
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {fileName ? fileName : "Drop your file here or click to upload"}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                PDF, DOCX, PPTX, TXT supported
              </p>
            </div>
            {fileName && (
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(124,58,237,0.15)", color: "#7C3AED" }}>
                ✓ File loaded
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>or paste text</span>
            <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
          </div>

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your lecture notes, textbook content, or any study material here..."
            rows={7}
            className="w-full rounded-2xl p-5 text-sm resize-none outline-none transition-all duration-300"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              lineHeight: 1.8,
            }}
            onFocus={e => e.target.style.borderColor = "#7C3AED"}
            onBlur={e => e.target.style.borderColor = "var(--border-default)"}
          />

          {/* Character count */}
          <div className="flex justify-between items-center mt-2 mb-6">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {text.length} characters
            </p>
            {text.length > 0 && (
              <button onClick={() => setText("")}
                className="text-xs font-medium transition-colors"
                style={{ color: "var(--text-muted)" }}>
                Clear text
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerateNotes}
              disabled={loading || !text.trim()}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, #7C3AED, #EC4899)`,
                boxShadow: loading ? "none" : "0 8px 30px rgba(124,58,237,0.4)",
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <> ✦ Generate Premium Notes </>
              )}
            </motion.button>

            {notes && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={exportPDF}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm transition-all"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10b981",
                }}
              >
                📥 Export PDF
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ── LOADING STATE ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 px-8 py-5 rounded-2xl mb-8"
              style={{
                background: ACCENT.dimBg,
                border: `1px solid ${ACCENT.border}`,
              }}
            >
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#7C3AED" }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                  />
                ))}
              </div>
              <p className="font-semibold text-sm" style={{ color: "#7C3AED" }}>
                AI is crafting your premium notes...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── NOTES OUTPUT ── */}
        <AnimatePresence>
          {notes && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Notes header bar */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#7C3AED" }} />
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Generated Notes</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: "rgba(124,58,237,0.12)", color: "#7C3AED" }}>
                    AI
                  </span>
                </div>
                <button onClick={exportPDF}
                  className="text-xs font-semibold transition-colors flex items-center gap-1"
                  style={{ color: "#7C3AED" }}>
                  📥 Save PDF
                </button>
              </div>

              <div
                id="notes-content"
                className="rounded-3xl p-10"
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${ACCENT.border}`,
                  boxShadow: `0 0 80px ${ACCENT.glow}`,
                }}
              >
                <article style={{ fontFamily: "var(--font-body)", color: "var(--text-primary)" }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ ...props }) => (
                        <h1 style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "2rem",
                          fontWeight: 800,
                          background: "linear-gradient(135deg, #7C3AED, #F59E0B)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          marginBottom: "1.5rem",
                          marginTop: "2rem",
                          lineHeight: 1.2,
                        }} {...props} />
                      ),
                      h2: ({ ...props }) => (
                        <h2 style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.4rem",
                          fontWeight: 700,
                          color: "#EC4899",
                          borderLeft: "3px solid #EC4899",
                          paddingLeft: "1rem",
                          marginTop: "2rem",
                          marginBottom: "1rem",
                          paddingTop: "0.25rem",
                          paddingBottom: "0.25rem",
                          background: "rgba(236,72,153,0.06)",
                          borderRadius: "0 8px 8px 0",
                        }} {...props} />
                      ),
                      h3: ({ ...props }) => (
                        <h3 style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: "#F59E0B",
                          marginTop: "1.5rem",
                          marginBottom: "0.75rem",
                        }} {...props} />
                      ),
                      p: ({ ...props }) => (
                        <p style={{
                          color: "var(--text-secondary)",
                          lineHeight: 1.9,
                          marginBottom: "1rem",
                          fontSize: "0.95rem",
                        }} {...props} />
                      ),
                      strong: ({ ...props }) => (
                        <strong style={{ color: "var(--text-primary)", fontWeight: 700 }} {...props} />
                      ),
                      li: ({ ...props }) => (
                        <li style={{
                          color: "var(--text-secondary)",
                          marginBottom: "0.5rem",
                          lineHeight: 1.8,
                          fontSize: "0.95rem",
                        }} {...props} />
                      ),
                      code: ({ ...props }) => (
                        <code style={{
                          background: "rgba(124,58,237,0.12)",
                          color: "#A78BFA",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "0.88em",
                          fontFamily: "monospace",
                        }} {...props} />
                      ),
                      blockquote: ({ ...props }) => (
                        <blockquote style={{
                          borderLeft: "3px solid #F59E0B",
                          paddingLeft: "1.25rem",
                          margin: "1.5rem 0",
                          background: "rgba(245,158,11,0.06)",
                          borderRadius: "0 12px 12px 0",
                          padding: "1rem 1.25rem",
                          color: "#FCD34D",
                          fontStyle: "italic",
                        }} {...props} />
                      ),
                      hr: () => (
                        <hr style={{
                          border: "none",
                          borderTop: "1px solid var(--border-subtle)",
                          margin: "2rem 0",
                        }} />
                      ),
                      table: ({ ...props }) => (
                        <div style={{ overflowX: "auto", margin: "1.5rem 0" }}>
                          <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "0.9rem",
                          }} {...props} />
                        </div>
                      ),
                      th: ({ ...props }) => (
                        <th style={{
                          background: "rgba(124,58,237,0.12)",
                          color: "#A78BFA",
                          padding: "10px 16px",
                          fontWeight: 700,
                          textAlign: "left",
                          border: "1px solid rgba(124,58,237,0.2)",
                        }} {...props} />
                      ),
                      td: ({ ...props }) => (
                        <td style={{
                          padding: "10px 16px",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-secondary)",
                        }} {...props} />
                      ),
                    }}
                  >
                    {notes}
                  </ReactMarkdown>
                </article>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── EMPTY STATE ── */}
        {!notes && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="text-6xl mb-2">📝</div>
            <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Ready to generate notes</p>
            <p className="text-sm text-center max-w-sm" style={{ color: "var(--text-muted)" }}>
              Upload a file or paste your study material above, then click Generate to get premium AI notes
            </p>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Notes;