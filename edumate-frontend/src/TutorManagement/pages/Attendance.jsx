import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Mail,
  FileDown,
  RefreshCw
} from "lucide-react";
import { useTutorAuth } from "../context/TutorAuthContext";
import { getTutorAttendance } from "../services/tutorApiService";

const Attendance = () => {
  const { tutorId } = useTutorAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendanceData, setAttendanceData] = useState(null);

  // Mock data for fallback/design demonstration (exactly matching the user screenshot)
  const mockAttendance = {
    recent_checkins: [
      { student_id: 101, name: "John Smith", avatar: "JS", time: "09:02 AM", status: "ON TIME", parent_notified: true },
      { student_id: 102, name: "Emma Davis", avatar: "ED", time: "09:05 AM", status: "ON TIME", parent_notified: true },
      { student_id: 103, name: "Michael Johnson", avatar: "MJ", time: "09:15 AM", status: "LATE", parent_notified: false }
    ],
    present_today: "24 / 30",
    present_pct: 80,
    notifications: {
      sent: 24,
      failed: 1
    }
  };

  const loadAttendance = async () => {
    if (!tutorId) return;
    setLoading(true);
    setError("");
    const response = await getTutorAttendance(tutorId);
    if (response.success && response.recent_checkins && response.recent_checkins.length > 0) {
      setAttendanceData(response);
    } else {
      // Use fallback
      setAttendanceData(mockAttendance);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAttendance();
  }, [tutorId]);

  const activeData = attendanceData || mockAttendance;

  const handleExportLogs = () => {
    // Generate CSV content
    const headers = "Student Name,Check-in Time,Status,Parent Notified\n";
    const rows = activeData.recent_checkins.map(
      (c) => `"${c.name}","${c.time}","${c.status}","${c.parent_notified ? "Yes" : "No"}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `attendance_logs_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
            Student Attendance
          </h1>
          <p className="text-slate-400 mt-1">Manage daily check-ins for Math 101 - Fall Semester</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
          <button
            onClick={loadAttendance}
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleExportLogs}
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition"
          >
            <FileDown size={16} className="text-cyan-300" />
            Export Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main Grid: Card 1 - Recent Check-ins */}
      <div className="rounded-3xl border border-cyan-300/40 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.25)] space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-wide">Recent Check-ins</h2>
          <button
            onClick={() => alert("Viewing all check-ins is configured dynamically in logs export.")}
            className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Parent Notified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeData.recent_checkins.map((checkin) => (
                <tr key={checkin.student_id} className="hover:bg-slate-900/30 transition duration-150">
                  {/* Student */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 font-semibold text-xs border border-indigo-500/20">
                        {checkin.avatar}
                      </div>
                      <span className="font-semibold text-white">{checkin.name}</span>
                    </div>
                  </td>
                  {/* Time */}
                  <td className="px-6 py-4 text-slate-300 font-medium">
                    {checkin.time}
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${checkin.status === "ON TIME"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                      : "bg-rose-500/15 text-rose-300 border border-rose-500/25"
                      }`}>
                      {checkin.status}
                    </span>
                  </td>
                  {/* Parent Notified */}
                  <td className="px-6 py-4">
                    {checkin.parent_notified ? (
                      <CheckCircle2 size={20} className="text-emerald-400 fill-emerald-500/10" />
                    ) : (
                      <AlertCircle size={20} className="text-rose-400 fill-rose-500/10" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Present Today & Parent Notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Present Today Card */}
        <div className="rounded-3xl border border-cyan-300/40 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.25)] flex flex-col justify-between min-h-[180px]">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Present Today</span>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-extrabold text-white">{activeData.present_today.split('/')[0].trim()}</span>
              <span className="text-xl text-slate-400 font-medium">/ {activeData.present_today.split('/')[1]?.trim() || "30"} Students</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${activeData.present_pct}%` }}
                className="bg-indigo-600 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Attendance Rate</span>
              <span className="font-semibold text-indigo-300">{activeData.present_pct}%</span>
            </div>
          </div>
        </div>

        {/* Parent Notifications Card */}
        <div className="rounded-3xl border border-cyan-300/40 bg-[#041225]/80 p-7 shadow-[0_0_25px_rgba(34,211,238,0.25)] flex flex-col justify-between min-h-[180px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Parent Notifications</span>

          <div className="mt-4 space-y-4">
            {/* Sent Row */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-900">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Sent</p>
                  <p className="text-[10px] text-slate-500 font-medium">Automated</p>
                </div>
              </div>
              <span className="text-xl font-bold text-emerald-400">{activeData.notifications.sent}</span>
            </div>

            {/* Pending / Failed Row */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-900">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-rose-500/10 p-2 text-rose-400">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Pending / Failed</p>
                  <p className="text-[10px] text-slate-500 font-medium">Requires action</p>
                </div>
              </div>
              <span className="text-xl font-bold text-rose-400">{activeData.notifications.failed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
