import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const NotificationContext = createContext({
  permission: "default",
  notifications: [],
  unreadCount: 0,
  requestPermission: async () => {},
  addNotification: () => {},
  markRead: () => {},
  markAllRead: () => {},
  clearAll: () => {},
  scheduleSessionReminders: () => {},
});

export function NotificationProvider({ children }) {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const scheduledTimers = useRef([]);
  const timetableRef = useRef(null);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "unsupported";
    if (!("Notification" in window)) return "unsupported";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const addNotification = useCallback((notif) => {
    const newNotif = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
    setUnreadCount((prev) => prev + 1);
    return newNotif.id;
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const sendBrowserNotification = useCallback((title, body, icon = "/favicon.ico") => {
    if (typeof Notification === "undefined") return;
    if (permission !== "granted") return;
    const notif = new Notification(title, { body, icon, badge: "/favicon.ico" });
    notif.onclick = () => { window.focus(); notif.close(); };
    setTimeout(() => notif.close(), 8000);
  }, [permission]);

  const scheduleSessionReminders = useCallback((timetable) => {
    scheduledTimers.current.forEach(clearTimeout);
    scheduledTimers.current = [];
    timetableRef.current = timetable;

    if (!timetable || !timetable.week) return;

    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const todayName = dayNames[new Date().getDay()];
    const todaySessions = timetable.week[todayName] || [];

    todaySessions.forEach((session) => {
      const sessionTime = parseSessionTime(session.time);
      if (!sessionTime) return;

      const now = new Date();
      const sessionDate = new Date();
      sessionDate.setHours(sessionTime.hours, sessionTime.minutes, 0, 0);

      const reminderTime = new Date(sessionDate.getTime() - 10 * 60 * 1000);
      const msUntilReminder = reminderTime - now;
      const msUntilSession = sessionDate - now;

      if (msUntilReminder > 0) {
        const t1 = setTimeout(() => {
          const title = `⏰ Starting in 10 min: ${session.subject}`;
          const body = `Topic: ${session.topic}\nTime: ${session.time} • Priority: ${session.priority}`;
          sendBrowserNotification(title, body);
          addNotification({
            type: "reminder",
            title: `Starting in 10 min: ${session.subject}`,
            subject: session.subject,
            topic: session.topic,
            time: session.time,
            priority: session.priority,
            duration: session.duration,
          });
        }, msUntilReminder);
        scheduledTimers.current.push(t1);
      }

      if (msUntilSession > 0) {
        const t2 = setTimeout(() => {
          const title = `📚 Study time! ${session.subject}`;
          const body = `Topic: ${session.topic}\nDuration: ${session.duration} • Priority: ${session.priority}`;
          sendBrowserNotification(title, body);
          addNotification({
            type: "session_start",
            title: `Study time: ${session.subject}`,
            subject: session.subject,
            topic: session.topic,
            time: session.time,
            priority: session.priority,
            duration: session.duration,
          });
        }, msUntilSession);
        scheduledTimers.current.push(t2);
      }
    });
  }, [sendBrowserNotification, addNotification]);

  useEffect(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight - now;

    const midnightTimer = setTimeout(() => {
      if (timetableRef.current) scheduleSessionReminders(timetableRef.current);
    }, msUntilMidnight);

    return () => {
      clearTimeout(midnightTimer);
      scheduledTimers.current.forEach(clearTimeout);
    };
  }, [scheduleSessionReminders]);

  return (
    <NotificationContext.Provider value={{
      permission, notifications, unreadCount,
      requestPermission, addNotification, markRead,
      markAllRead, clearAll, scheduleSessionReminders,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

function parseSessionTime(timeStr) {
  if (!timeStr) return null;
  const ampm = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!ampm) return null;
  let hours = parseInt(ampm[1]);
  const minutes = parseInt(ampm[2]);
  const period = ampm[3]?.toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

export function useNotifications() {
  return useContext(NotificationContext);
}