import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";

const priorityColor = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

const priorityBg = {
  high: "rgba(239,68,68,0.1)",
  medium: "rgba(245,158,11,0.1)",
  low: "rgba(34,197,94,0.1)",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const { notifications, unreadCount, markRead, markAllRead, clearAll, requestPermission, permission } =
    useNotifications();

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleBellClick = async () => {
    if (permission === "default") await requestPermission();
    setOpen((v) => !v);
    if (!open) markAllRead();
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const diff = (Date.now() - d) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        style={{
          position: "relative",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary, #94a3b8)",
          transition: "all 0.2s",
        }}
        title="Notifications"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          {unreadCount > 0 && (
            <circle cx="18" cy="6" r="4" fill="#06b6d4" stroke="none"/>
          )}
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            background: "linear-gradient(135deg, #06b6d4, #7c3aed)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: "700",
            borderRadius: "10px",
            minWidth: "18px",
            height: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 10px)",
          right: 0,
          width: "360px",
          maxHeight: "520px",
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(6, 182, 212, 0.2)",
          borderRadius: "16px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          zIndex: 9999,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "15px", color: "#f1f5f9" }}>Notifications</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                {notifications.length === 0 ? "No reminders yet" : `${notifications.length} total`}
              </p>
            </div>
            {notifications.length > 0 && (
              <button onClick={clearAll} style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#64748b",
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}>Clear all</button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔔</div>
                <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>
                  Your study reminders will appear here
                </p>
                <p style={{ color: "#334155", fontSize: "12px", margin: "6px 0 0" }}>
                  Generate a timetable to start getting reminders
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    cursor: "pointer",
                    background: notif.read ? "transparent" : "rgba(6,182,212,0.04)",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: notif.type === "reminder" ? "rgba(245,158,11,0.15)" : "rgba(6,182,212,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "18px", flexShrink: 0,
                    }}>
                      {notif.type === "reminder" ? "⏰" : "📚"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>
                        {notif.subject}
                      </p>
                      <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 }}>
                        {notif.topic}
                      </p>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{
                          fontSize: "11px", padding: "2px 8px", borderRadius: "6px",
                          background: "rgba(255,255,255,0.07)", color: "#94a3b8",
                        }}>🕐 {notif.time}</span>
                        {notif.duration && (
                          <span style={{
                            fontSize: "11px", padding: "2px 8px", borderRadius: "6px",
                            background: "rgba(255,255,255,0.07)", color: "#94a3b8",
                          }}>⏱ {notif.duration}</span>
                        )}
                        {notif.priority && (
                          <span style={{
                            fontSize: "11px", padding: "2px 8px", borderRadius: "6px",
                            background: priorityBg[notif.priority?.toLowerCase()] || "rgba(255,255,255,0.07)",
                            color: priorityColor[notif.priority?.toLowerCase()] || "#94a3b8",
                            fontWeight: 600,
                          }}>{notif.priority}</span>
                        )}
                        <span style={{ fontSize: "11px", color: "#475569", marginLeft: "auto" }}>
                          {formatTime(notif.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Permission warning */}
          {permission !== "granted" && (
            <div style={{
              padding: "12px 20px",
              background: "rgba(245,158,11,0.1)",
              borderTop: "1px solid rgba(245,158,11,0.2)",
              flexShrink: 0,
            }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#f59e0b" }}>
                ⚠️ Enable browser notifications to get alerts even when the tab is in the background
              </p>
              <button
                onClick={requestPermission}
                style={{
                  marginTop: "8px", background: "#f59e0b", border: "none",
                  color: "#000", fontSize: "12px", fontWeight: 600,
                  padding: "6px 14px", borderRadius: "8px", cursor: "pointer",
                }}
              >
                Enable Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}