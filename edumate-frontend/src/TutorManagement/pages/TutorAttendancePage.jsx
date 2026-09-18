import { useState, useEffect } from "react";
import {
  CalendarCheck, Users, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, RefreshCw, BookOpen,
} from "lucide-react";
import { getTutorAttendance, getCourseAttendanceDetail, markAttendance } from "../services/tutorApiService";
import { useTutorAuth } from "../context/TutorAuthContext";

const statusColour = {
  present: "bg-green-500/20 text-green-400 border-green-400/30",
  late:    "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
  absent:  "bg-red-500/20 text-red-400 border-red-400/30",
};

function ProgressRing({ pct, size = 64 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const colour = pct >= 75 ? "#4ade80" : pct >= 50 ? "#fbbf24" : "#f87171";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={7} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colour} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      <text x="50%" y="54%" fill={colour} fontSize="13" fontWeight="700" textAnchor="middle"
        dominantBaseline="middle" className="rotate-90 origin-center" style={{ transform: `rotate(90deg)`, transformOrigin: "50% 50%" }}>
        {pct}%
      </text>
    </svg>
  );
}

function SessionBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${statusColour[status] || statusColour.absent}`}>
      {status === "present" ? <CheckCircle size={10} /> : status === "late" ? <Clock size={10} /> : <XCircle size={10} />}
      {status}
    </span>
  );
}

// ── Mark Attendance Modal ───────────────────────────────────────
function MarkAttendanceModal({ course, onClose, onSave }) {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionName, setSessionName] = useState("Class Session");
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getCourseAttendanceDetail(course.course_id);
      if (res.success) {
        setStudents(res.students || []);
        const defaults = {};
        (res.students || []).forEach(s => { defaults[s.student_id] = "present"; });
        setMarks(defaults);
      }
      setLoading(false);
    };
    load();
  }, [course.course_id]);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      await Promise.all(
        students.map(s =>
          markAttendance({
            student_id: s.student_id,
            course_id: course.course_id,
            session_date: date,
            session_name: sessionName,
            status: marks[s.student_id] || "present",
            marked_by: "Tutor",
          })
        )
      );
      setMsg("✓ Attendance saved successfully!");
      setTimeout(() => { onSave(); onClose(); }, 1200);
    } catch {
      setMsg("Error saving attendance.");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-cyan-400/30 bg-[#040f20] shadow-[0_0_40px_rgba(34,211,238,0.25)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Mark Attendance</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
        </div>
        <p className="text-sm text-slate-400 mb-4">{course.course_title}</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Session Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Session Name</label>
            <input type="text" value={sessionName} onChange={e => setSessionName(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-cyan-300 py-6">Loading students…</p>
        ) : students.length === 0 ? (
          <p className="text-center text-slate-500 py-6">No students enrolled yet.</p>
        ) : (
          <div className="space-y-2 mb-5">
            {students.map(s => (
              <div key={s.student_id} className="flex items-center justify-between rounded-xl border border-slate-700/40 bg-slate-900/50 px-4 py-2.5">
                <div>
                  <p className="text-sm text-white">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.email}</p>
                </div>
                <div className="flex gap-1.5">
                  {["present", "late", "absent"].map(st => (
                    <button
                      key={st}
                      onClick={() => setMarks(m => ({ ...m, [s.student_id]: st }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition capitalize ${
                        marks[s.student_id] === st ? statusColour[st] : "border-slate-700 text-slate-500 hover:border-slate-500"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {msg && <p className="text-sm text-center mb-3 text-cyan-300">{msg}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-600 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-400 transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-sm font-semibold text-[#020617] transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Course attendance card ──────────────────────────────────────
function CourseAttendanceCard({ course }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [marking, setMarking] = useState(false);

  const loadDetail = async () => {
    setDetailLoading(true);
    const res = await getCourseAttendanceDetail(course.course_id);
    if (res.success) setDetail(res);
    setDetailLoading(false);
  };

  const toggle = () => {
    if (!expanded && !detail) loadDetail();
    setExpanded(e => !e);
  };

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-[#041225]/80 overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.1)]">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/20 transition" onClick={toggle}>
        <div className="flex items-center gap-4">
          <ProgressRing pct={course.attendance_rate} />
          <div>
            <p className="font-semibold text-white">{course.course_title}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {course.total_records} records · {course.present_count} present · {course.absent_count} absent
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); setMarking(true); }}
            className="px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs hover:bg-cyan-400/20 transition"
          >
            Mark Attendance
          </button>
          {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>

      {/* Expanded students */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-700/40">
          {detailLoading ? (
            <p className="text-center text-cyan-300 py-4 text-sm">Loading…</p>
          ) : detail?.students?.length > 0 ? (
            <div className="mt-4 space-y-2">
              {detail.students.map(s => (
                <div key={s.student_id} className="rounded-xl border border-slate-700/30 bg-slate-900/40 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${s.attendance_percentage >= 75 ? "text-green-400" : s.attendance_percentage >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {s.attendance_percentage ?? 0}%
                      </p>
                      <p className="text-xs text-slate-500">{s.present}/{s.total_sessions} sessions</p>
                    </div>
                  </div>
                  {/* Last 5 records */}
                  {s.records?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {s.records.slice(0, 8).map(r => (
                        <div key={r.attendance_id} className="text-center">
                          <SessionBadge status={r.status} />
                          <p className="text-xs text-slate-600 mt-0.5">{r.session_date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4 text-sm">No attendance records yet for this course.</p>
          )}
        </div>
      )}

      {/* Mark modal */}
      {marking && (
        <MarkAttendanceModal
          course={course}
          onClose={() => setMarking(false)}
          onSave={() => { loadDetail(); }}
        />
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
const TutorAttendancePage = () => {
  const { tutorId } = useTutorAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    const res = await getTutorAttendance(tutorId);
    if (res.success) setData(res);
    else setError(res.message || "Failed to load attendance.");
    setLoading(false);
  };

  useEffect(() => { if (tutorId) load(); }, [tutorId]);

  const totalStudents = data?.courses?.reduce((s, c) =>
    s + new Set(c.sessions?.map(x => x.present + x.absent)).size, 0) ?? 0;
  const avgRate = data?.courses?.length
    ? (data.courses.reduce((s, c) => s + c.attendance_rate, 0) / data.courses.length).toFixed(1)
    : 0;
  const totalRecords = data?.courses?.reduce((s, c) => s + c.total_records, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_35%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Tutor Dashboard</p>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-slate-400 text-sm mt-1">Track and mark attendance across your courses</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-sm hover:bg-cyan-400/20 transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Courses",       value: data?.courses?.length ?? 0,  icon: <BookOpen size={20} className="text-cyan-300" /> },
          { label: "Total Records", value: totalRecords,                 icon: <CalendarCheck size={20} className="text-purple-300" /> },
          { label: "Avg Rate",      value: `${avgRate}%`,               icon: <CheckCircle size={20} className="text-green-300" /> },
        ].map(c => (
          <div key={c.label} className="rounded-2xl border border-slate-700/50 bg-[#041225]/80 p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-slate-800/50">{c.icon}</div>
            <div>
              <p className="text-2xl font-bold text-white">{c.value}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-cyan-300 gap-2">
          <RefreshCw size={18} className="animate-spin" /> Loading attendance data…
        </div>
      ) : data?.courses?.length === 0 ? (
        <div className="rounded-3xl border border-slate-700/40 bg-[#041225]/80 p-12 text-center">
          <CalendarCheck size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No courses found. Create a course to start tracking attendance.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.courses?.map(course => (
            <CourseAttendanceCard key={course.course_id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorAttendancePage;
