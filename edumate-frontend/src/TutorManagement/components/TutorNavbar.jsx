import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, User, Lock, LogOut, CheckCircle, HelpCircle } from "lucide-react";
import { useTutorAuth } from "../context/TutorAuthContext";

const pageTitles = {
  "/tutor": "Tutor Dashboard",
  "/tutor/courses": "Courses",
  "/tutor/create-course": "Create Course",
  "/tutor/create-quiz": "Create Quiz",
  "/tutor/profile": "Tutor Profile",
  "/tutor/student-monitoring": "Student Monitoring",
  "/tutor/change-password": "Change Password",
  "/tutor/notifications": "Notifications",
  "/tutor/availability": "Availability",
  "/tutor/help": "Help & Support",
};

const TutorNavbar = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const location = useLocation();
  const { tutor, logout } = useTutorAuth();
  const currentPath = location.pathname.replace(/\/$/, "");
  const pageTitle = pageTitles[currentPath] || "Tutor Dashboard";
  const tutorName = tutor?.full_name || "Tutor";
  const tutorEmail = tutor?.email || "tutor@edumate.lk";

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-[#02111f]/90 backdrop-blur-xl border-b border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
      <div className="flex items-center gap-4">
        <div className="rounded-3xl bg-slate-950/80 border border-cyan-400/20 px-5 py-3 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Current page</p>
          <h1 className="mt-1 text-2xl font-semibold text-white leading-tight">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative flex items-center gap-2 rounded-2xl px-5 py-3 bg-cyan-500/10 text-cyan-100 ring-1 ring-cyan-400/20 hover:bg-cyan-500/20 transition shadow-[0_0_24px_rgba(34,211,238,0.18)]">
          <Bell size={18} className="text-cyan-300" />
          <span className="font-medium">Notifications</span>
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-pink-500 text-[11px] font-semibold text-white flex items-center justify-center shadow-lg shadow-pink-500/25">
            3
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="relative w-12 h-12 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 shadow-[0_0_20px_rgba(168,85,247,0.6)] flex items-center justify-center"
          >
            <User size={22} className="text-white" />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border border-[#02111f]" />
          </button>

          {openProfile && (
            <div className="absolute right-0 mt-4 w-56 rounded-2xl border border-cyan-400/30 bg-[#061527] shadow-[0_0_25px_rgba(34,211,238,0.35)] overflow-hidden z-50">
              <div className="px-4 py-4 border-b border-cyan-400/10">
                <p className="font-semibold text-white">{tutorName}</p>
                <p className="text-sm text-slate-400">{tutorEmail}</p>
              </div>

              <div className="p-2">
                <Link
                  to="/tutor/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-cyan-400/10"
                >
                  <User size={18} /> My Profile
                </Link>

                <Link
                  to="/tutor/change-password"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-cyan-400/10"
                >
                  <Lock size={18} /> Change Password
                </Link>

                <Link
                  to="/tutor/notifications"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-cyan-400/10"
                >
                  <Bell size={18} /> Notification Settings
                </Link>

                <Link
                  to="/tutor/availability"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-cyan-400/10"
                >
                  <CheckCircle size={18} /> Availability Status
                </Link>

                <Link
                  to="/tutor/help"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-cyan-400/10"
                >
                  <HelpCircle size={18} /> Help & Support
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TutorNavbar;