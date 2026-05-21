import { useEffect, useRef } from "react";
import API from "../api/axios";

export default function useSessionTracker(pageName) {
  const startTime = useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
    return () => {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      if (duration < 5) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      API.post(
        "/analytics/session-log",
        { page: pageName, duration_seconds: duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    };
  }, [pageName]);
}