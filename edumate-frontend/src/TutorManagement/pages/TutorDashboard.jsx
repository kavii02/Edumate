import { useState, useEffect } from "react";
import {
  TrendingUp,
  PenLine,
  BellRing,
  MessageCircle,
  CalendarDays,
} from "lucide-react";
import StatCard from "../components/StatCard";
import { getDashboardStats } from "../services/tutorApiService";
import { useTutorAuth } from "../context/TutorAuthContext";

const TutorDashboard = () => {
  const { tutorId, tutor } = useTutorAuth();
  const [stats, setStats] = useState({
    total_courses: 0,
    total_students: 0,
    total_quizzes: 0,
    total_assignments: 0,
    unread_queries: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // Real Calendar states & helpers
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const y = prev.getFullYear();
      const m = prev.getMonth();
      return new Date(y, m - 1, 1);
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const y = prev.getFullYear();
      const m = prev.getMonth();
      return new Date(y, m + 1, 1);
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const isToday = (dayNum) => {
    const today = new Date();
    return (
      dayNum === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const getHighlightDaysForMonth = (y, m) => {
    if (m === 5 && y === 2026) {
      return [4, 11, 14, 15, 25];
    }
    return [5, 12, 19, 26]; // default highlighting Fridays
  };

  const eventDays = getHighlightDaysForMonth(year, month);

  useEffect(() => {
    if (!tutorId) return;

    const fetchStats = async () => {
      const response = await getDashboardStats(tutorId);
      if (response.success) {
        setStats(response.dashboard);
      }
      setLoading(false);
    };

    fetchStats();
  }, [tutorId]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
      <h1 className="text-3xl font-bold mb-7">
        Welcome Back, {tutor?.first_name || tutor?.full_name || "Tutor"} 👋
      </h1>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1fr]">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Total Courses"
              value={loading ? "..." : stats.total_courses}
              icon={<TrendingUp />}
            />
            <StatCard
              title="Students"
              value={loading ? "..." : stats.total_students}
              icon={<TrendingUp />}
            />
            <StatCard
              title="Assignments"
              value={loading ? "..." : stats.total_assignments}
              icon={<TrendingUp />}
            />
            <StatCard
              title="Quizzes"
              value={loading ? "..." : stats.total_quizzes}
              icon={<TrendingUp />}
            />
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-[#041225]/80 p-5 shadow-[0_0_18px_rgba(34,211,238,0.18)] flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quick Post Announcement</h2>
            <button className="w-11 h-11 rounded-full bg-purple-500 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.7)]">
              <PenLine size={20} />
            </button>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-[#041225]/80 p-5 shadow-[0_0_18px_rgba(34,211,238,0.18)] flex items-center justify-between">
            <h2 className="text-xl font-semibold">Unread Student Queries</h2>
            <span className="w-11 h-11 rounded-full bg-pink-500/70 flex items-center justify-center font-bold">
              {loading ? "..." : stats.unread_queries}
            </span>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-[#041225]/80 p-5 shadow-[0_0_18px_rgba(34,211,238,0.18)] flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Course Updates Feed</h2>
            <button className="w-11 h-11 rounded-full bg-violet-500 flex items-center justify-center shadow-[0_0_18px_rgba(139,92,246,0.7)]">
              <BellRing size={20} />
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-3xl border border-cyan-300/60 bg-[#041225]/80 p-6 shadow-[0_0_25px_rgba(34,211,238,0.65)]">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="text-cyan-300" />
                    <h2 className="text-xl font-semibold">
                      Class Calendar
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs px-2"
                    >
                      &lt;
                    </button>
                    <span className="text-xs font-semibold text-cyan-200 min-w-[75px] text-center">
                      {monthNames[month].slice(0, 3)} {year}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs px-2"
                    >
                      &gt;
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                    <div key={idx}>{day}</div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-7 gap-2 text-center text-sm">
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <div key={`pad-${idx}`} className="py-2"></div>
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((num) => {
                    const active = isToday(num);
                    const hasEvent = eventDays.includes(num);
                    return (
                      <div
                        key={num}
                        className={`rounded-lg py-1.5 transition relative font-medium ${
                          active
                            ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(34,211,238,0.7)]"
                            : "bg-slate-900/50 hover:bg-slate-800/80 text-slate-300"
                        }`}
                      >
                        {num}
                        {hasEvent && !active && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-5">
                  Upcoming Deadlines
                </h2>

                <div className="space-y-4">
                  {[
                    "Assignment - Due Aug 2026",
                    "Quiz - Due Jun 2026",
                    "Course Material Review",
                    "Student Feedback Check",
                  ].map((item) => (
                    <div
                      key={item}
                      className="border-b border-slate-700 pb-3 text-slate-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-300/60 bg-[#041225]/80 p-6 shadow-[0_0_25px_rgba(34,211,238,0.65)]">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="text-cyan-300" />
              <h2 className="text-xl font-semibold">
                Recent Course Updates Feed
              </h2>
            </div>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                placeholder="Add update..."
                className="flex-1 rounded-xl bg-slate-900/80 border border-slate-600 px-4 py-2 outline-none focus:border-cyan-300"
              />
              <button className="rounded-xl bg-blue-600 px-5 py-2 font-semibold hover:bg-blue-500">
                Send
              </button>
            </div>

            <div className="space-y-2 text-slate-200">
              <p>Flexible</p>
              <p>Prefered Exchange Types</p>
              <p>Virtual/Video Call</p>
              <p>In-Person with safety guidelines</p>
              <p>Document Exchange</p>
              <p>...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;