import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, User, Settings, Lock, LogOut } from "lucide-react";

const TutorNavbar = () => {
  const [openProfile, setOpenProfile] = useState(false);

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-[#02111f]/90 backdrop-blur-xl border-b border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-cyan-300/40 shadow-[0_0_15px_rgba(34,211,238,0.5)] flex items-center justify-center">
          <span className="text-2xl font-bold text-purple-200">E</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">EduMate</h1>
          <p className="text-xs text-cyan-300 tracking-wide">Tutor Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative flex items-center gap-2 rounded-xl px-5 py-3 bg-blue-600 hover:bg-blue-500 transition shadow-[0_0_20px_rgba(59,130,246,0.4)]">
          <Bell size={18} />
          <span className="font-medium">Notifications</span>
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-pink-500 text-xs flex items-center justify-center">
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
                <p className="font-semibold text-white">Tutor Name</p>
                <p className="text-sm text-slate-400">tutor@edumate.lk</p>
              </div>

              <div className="p-2">
                <Link
                  to="/tutor/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-cyan-400/10"
                >
                  <User size={18} /> My Profile
                </Link>

                <Link
                  to="/tutor/profile/edit"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-cyan-400/10"
                >
                  <Settings size={18} /> Edit Profile
                </Link>

                <Link
                  to="/tutor/change-password"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-cyan-400/10"
                >
                  <Lock size={18} /> Change Password
                </Link>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10">
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