import { Routes, Route, Navigate }
from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";
import Notes from "../pages/Notes";
import Quiz from "../pages/Quiz";
import Flashcards from "../pages/Flashcards";
import Chatbot from "../pages/Chatbot";
import Analytics from "../pages/Analytics";
import Timetable from "../pages/Timetable";
import Settings from "../pages/Settings";
import PomodoroPage from "../pages/PomodoroPage";

import ProtectedRoute from
"../components/ProtectedRoute";

function AppRoutes() {

  return (

    <Routes>

      {/* ✅ PUBLIC ROUTES */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ✅ DASHBOARD */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ NOTES */}

      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />

      {/* ✅ QUIZ */}

      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />

      {/* ✅ FLASHCARDS */}

      <Route
        path="/flashcards"
        element={
          <ProtectedRoute>
            <Flashcards />
          </ProtectedRoute>
        }
      />

      {/* ✅ CHATBOT */}

      <Route
        path="/chatbot"
        element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        }
      />

      {/* ✅ ANALYTICS */}

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* ✅ TIMETABLE */}

      <Route
        path="/timetable"
        element={
          <ProtectedRoute>
            <Timetable />
          </ProtectedRoute>
        }
      />

      {/* ✅ SETTINGS */}

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ✅ POMODORO */}

      <Route
        path="/pomodoro"
        element={
          <ProtectedRoute>
            <PomodoroPage />
          </ProtectedRoute>
        }
      />

      {/* ✅ UNKNOWN ROUTES */}

      <Route
        path="*"
        element={
          <Navigate to="/" />
        }
      />

    </Routes>
  );
}

export default AppRoutes;