# StudentGPT 🎓

An AI-powered academic productivity operating system built for students who refuse to be average.

![StudentGPT](https://img.shields.io/badge/AI-Powered-cyan) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green) ![React](https://img.shields.io/badge/Frontend-React-blue)

---

## 🚀 Features

- **AI Smart Notes** — Upload PDF/DOCX/TXT and get premium AI-generated notes
- **AI Quiz Generator** — Generate MCQs with difficulty levels and timer
- **AI Flashcards** — Smart study cards with mastery tracking and flip animations
- **AI Chatbot** — Ask any academic question with markdown-formatted answers
- **Study Planner** — AI-generated weekly timetable based on your syllabus
- **Pomodoro Timer** — Focus timer with motivational messages and session tracking
- **Analytics Dashboard** — Real-time study performance tracking with charts
- **Dark & Light Mode** — Fully adaptive UI for both modes

---

## 🛠️ Tech Stack

### Frontend
- React + Vite
- TailwindCSS
- Framer Motion
- Recharts
- React Router DOM
- Axios

### Backend
- FastAPI
- SQLAlchemy + SQLite
- JWT Authentication
- Bcrypt password hashing
- Groq API (LLaMA 3.1)

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/SahilAbbas/studentgpt.git
cd studentgpt
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file in the backend folder: