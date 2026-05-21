import { useState, useEffect } from "react";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import useSessionTracker from "../hooks/useSessionTracker";
import { generateQuiz } from "../api/quizApi";
import { uploadFile } from "../api/notesApi";
import { useLocalState } from "../hooks/useLocalState";

function Quiz() {
  useSessionTracker("Quiz");

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const [difficulty, setDifficulty] = useLocalState("quiz_difficulty", "easy");
  const [count, setCount] = useLocalState("quiz_count", 5);
  const [quiz, setQuiz] = useLocalState("quiz_questions", []);
  const [answers, setAnswers] = useLocalState("quiz_answers", {});
  const [score, setScore] = useLocalState("quiz_score", null);
  const [showScore, setShowScore] = useLocalState("quiz_show_score", false);
  const [timeLeft, setTimeLeft] = useLocalState("quiz_time_left", 300);

  useEffect(() => {
    if (quiz.length === 0 || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, timeLeft]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await uploadFile(file);
      setText(data?.text || "");
    } catch {
      alert("Upload failed");
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) { alert("Please upload or enter text"); return; }
    setLoading(true);
    try {
      const response = await generateQuiz(text, difficulty, count);
      setQuiz(response?.quiz || []);
      setAnswers({});
      setScore(null);
      setShowScore(false);
      setTimeLeft(count * 60);
    } catch (error) {
      alert(error?.response?.data?.detail || "Quiz generation failed");
    }
    setLoading(false);
  };

  const handleAnswer = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const saveQuizResult = async (score, total) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/analytics/quiz-result",
        { subject: "General", score, total },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save quiz result", err);
    }
  };

  const calculateScore = () => {
    let total = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.answer) total++;
    });
    setScore(total);
    setShowScore(true);
    saveQuizResult(total, quiz.length);
  };

  const handleReset = () => {
    setQuiz([]);
    setAnswers({});
    setScore(null);
    setShowScore(false);
    setTimeLeft(300);
    setText("");
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-10">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
            AI Quiz Generator
          </h1>
          {quiz.length > 0 && (
            <button onClick={handleReset} className="ghost-btn">
              Start New Quiz
            </button>
          )}
        </div>

        <div className="glass p-8 rounded-3xl mb-10">
          <input type="file" onChange={handleFileUpload} className="mb-6" />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Upload file or paste notes..."
            className="input w-full h-48 mb-6"
          />
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input mb-6">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="input mb-6">
            <option value={5}>5 MCQs</option>
            <option value={20}>20 MCQs</option>
            <option value={30}>30 MCQs</option>
            <option value={40}>40 MCQs</option>
            <option value={50}>50 MCQs</option>
          </select>
          <button onClick={handleGenerate} disabled={loading} className="gradient-btn px-8 py-4 rounded-2xl text-xl font-bold">
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
        </div>

        {quiz.length > 0 && (
          <div className="text-3xl font-extrabold text-yellow-300 mb-10">
            ⏳ Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        )}

        <div className="space-y-8">
          {quiz.map((q, index) => (
            <div key={index} className="glass p-8 rounded-3xl">
              <h2 className="text-3xl font-bold text-cyan-400 mb-8">
                {index + 1}. {q.question}
              </h2>
              <div className="space-y-4">
                {(q.options || []).map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(index, option)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all text-lg ${
                      showScore && option === q.answer
                        ? "bg-green-500/20 border-green-400"
                        : answers[index] === option
                        ? "bg-cyan-500/20 border-cyan-400"
                        : "bg-slate-800 border-slate-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {showScore && (
                <div className="mt-6 text-yellow-300 text-lg">
                  ✅ Correct Answer: {q.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {quiz.length > 0 && !showScore && (
          <button onClick={calculateScore} className="gradient-btn px-8 py-4 rounded-2xl text-xl font-bold mt-10">
            Submit Quiz
          </button>
        )}

        {score !== null && (
          <div className="mt-10 text-5xl font-extrabold text-yellow-300">
            🎯 Score: {score}/{quiz.length}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Quiz;