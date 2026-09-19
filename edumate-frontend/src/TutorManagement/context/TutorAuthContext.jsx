import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearTutorSession,
  getTutorSession,
  saveTutorSession,
} from "../../services/authApiService";

const TutorAuthContext = createContext(null);

export const TutorAuthProvider = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const tutor = getTutorSession();
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const refreshNotifications = async () => {
    if (!tutor?.token) return;
    setNotificationsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/notifications/tutor", {
        headers: { Authorization: `Bearer ${tutor.token}` },
      });
      const data = await response.json();
      if (data.success) setNotifications(data.notifications || []);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => { refreshNotifications(); }, [tutor?.token]);

  const markNotificationRead = async (notificationId) => {
    if (!tutor?.token) return;
    await fetch(`http://localhost:5000/api/notifications/tutor/${notificationId}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tutor.token}` },
    });
    setNotifications((current) => current.map((notification) => notification.id === notificationId ? { ...notification, unread: false } : notification));
  };

  const markAllNotificationsRead = async () => {
    if (!tutor?.token) return;
    await fetch("http://localhost:5000/api/notifications/tutor/read-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${tutor.token}` },
    });
    setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })));
  };

  const logout = () => {
    clearTutorSession();
    onLogout?.();
    navigate("/", { replace: true });
  };

  const value = useMemo(
    () => ({
      tutor,
      tutorId: tutor?.tutor_id ?? null,
      isAuthenticated: Boolean(tutor?.tutor_id),
      logout,
      saveTutorSession,
      notifications,
      notificationsLoading,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [tutor, onLogout, notifications, notificationsLoading]
  );

  return (
    <TutorAuthContext.Provider value={value}>{children}</TutorAuthContext.Provider>
  );
};

export const useTutorAuth = () => {
  const context = useContext(TutorAuthContext);

  if (!context) {
    throw new Error("useTutorAuth must be used within TutorAuthProvider");
  }

  return context;
};

export default TutorAuthContext;
