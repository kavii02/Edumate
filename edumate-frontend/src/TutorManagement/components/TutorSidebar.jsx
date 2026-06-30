import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  PlusSquare,
  FileQuestion,
  BarChart3,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/tutor", icon: LayoutDashboard },
  { name: "Courses", path: "/tutor/courses", icon: BookOpen },
  { name: "Student Monitoring", path: "/tutor/student-monitoring", icon: TrendingUp },
  { name: "Create Courses", path: "/tutor/create-course", icon: PlusSquare },
  { name: "Create Quizzes", path: "/tutor/create-quiz", icon: FileQuestion },
  { name: "Analytics", path: "/tutor/analytics", icon: BarChart3 },
  { name: "Attendance", path: "/tutor/attendance", icon: CalendarCheck },
];

const TutorSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/tutor" && location.pathname === "/tutor") {
      return true;
    }
    if (path !== "/tutor" && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <aside className="w-72 min-h-screen bg-[#020b18] border-r border-cyan-400/20 p-5 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-cyan-300/40 shadow-[0_0_20px_rgba(34,211,238,0.5)] flex items-center justify-center text-2xl font-bold text-purple-200">
          E
        </div>
        <h2 className="text-2xl font-bold text-white">EduMate</h2>
      </div>

      <nav className="rounded-3xl border border-fuchsia-400/60 bg-[#031020]/70 p-4 shadow-[0_0_25px_rgba(217,70,239,0.7)]">
        <div className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-white transition
                ${active
                    ? "bg-cyan-400/30 shadow-[0_0_18px_rgba(34,211,238,0.7)]"
                    : "hover:bg-cyan-400/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.45)]"
                  }`}
              >
                <Icon size={22} className="text-cyan-300" />
                <span className="text-lg">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default TutorSidebar;