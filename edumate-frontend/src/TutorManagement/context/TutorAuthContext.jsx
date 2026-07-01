import { createContext, useContext, useMemo } from "react";
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
    }),
    [tutor, onLogout]
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
