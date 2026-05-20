import { useEffect, useRef } from "react";
import axios from "axios";

export default function useSessionTracker(pageName) {
  const startTime = useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      if (duration < 5) return; // ignore accidental visits
      const token = localStorage.getItem("token");
      if (!token) return;

      // Use sendBeacon so it fires even on page unload
      const payload = JSON.stringify({ page: pageName, duration_seconds: duration });
      navigator.sendBeacon
        ? navigator.sendBeacon(
            "http://localhost:8000/api/analytics/session-log",
            new Blob([payload], { type: "application/json" })
          )
        : axios.post(
            "http://localhost:8000/api/analytics/session-log",
            { page: pageName, duration_seconds: duration },
            { headers: { Authorization: `Bearer ${token}` } }
          );
    };
  }, [pageName]);
}