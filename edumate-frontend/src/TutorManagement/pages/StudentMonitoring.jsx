import { useState, useEffect } from "react";
import {
  TrendingUp, AlertTriangle, ShieldCheck, Users,
  BookOpen, BarChart3, ChevronDown, ChevronUp,
  RefreshCw, Brain, Activity, Eye,
} from "lucide-react";
import {
  getTutorStudents,
  getStudentDetail,
  predictAllStudents,
  predictStudent,
  trainAIModel,
  getAIStatus,
} from "../services/tutorApiService";
import { useTutorAuth } from "../context/TutorAuthContext";

// ── risk colour helpers ─────────────────────────────────────────
const riskColour = {
  High:   "text-red-400 bg-red-400/10 border-red-400/30",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  Low:    "text-green-400 bg-green-400/10 border-green-400/30",
};
const riskIcon = {
  High:   <AlertTriangle size={14} className="text-red-400" />,
  Medium: <Activity size={14} className="text-yellow-400" />,
  Low:    <ShieldCheck size={14} className="text-green-400" />,
};

// ── Simple bar chart ────────────────────────────────────────────
function MiniBar({ value, max = 100, colour = "bg-cyan-400" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full h-2 rounded-full bg-slate-700/60">
      <div className={`h-2 rounded-full ${colour}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Student Detail Modal ────────────────────────────────────────
function StudentDetailModal({ student, tutorId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [ai, setAi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    const load = async () => {
      setLoading(true);
      const [d, p] = await Promise.all([
        getStudentDetail(student.student_id, tutorId),
        predictStudent(student.student_id),
      ]);
      if (d.success) setDetail(d);
      if (p && !p.error) setAi(p);
      setLoading(false);
    };
    load();
  }, [student, tutorId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-cyan-400/30 bg-[#040f20] shadow-[0_0_40px_rgba(34,211,238,0.25)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">{student.name}</h2>
            <p className="text-sm text-slate-400">{student.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-cyan-300">Loading…</div>
        ) : (
          <>
            {/* AI Risk Badge */}
            {ai && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border mb-5 ${riskColour[ai.predicted_risk] || riskColour.Low}`}>
                {riskIcon[ai.predicted_risk]}
                {ai.predicted_risk} Risk
                {ai.confidence && (
                  <span className="opacity-70 text-xs ml-1">({(ai.confidence * 100).toFixed(0)}% confidence)</span>
                )}
              </div>
            )}

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Avg Quiz", value: `${detail?.student.avg_quiz_score ?? 0}%`, colour: "text-cyan-400" },
                { label: "Attendance", value: `${detail?.student.attendance_percentage ?? 0}%`, colour: "text-purple-400" },
                { label: "Sessions", value: detail?.student.attendance_total ?? 0, colour: "text-slate-300" },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-3 text-center">
                  <p className={`text-lg font-bold ${s.colour}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Quiz results */}
            {detail?.quiz_results?.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Quiz History</h3>
                <div className="space-y-2">
                  {detail.quiz_results.map(r => (
                    <div key={r.result_id} className="flex items-center justify-between rounded-xl border border-slate-700/40 bg-slate-900/50 px-4 py-2.5">
                      <div>
                        <p className="text-sm text-white">{r.quiz_title}</p>
                        <p className="text-xs text-slate-500">{r.course_title} · {r.attempted_at?.slice(0, 10)}</p>
                      </div>
                      <span className={`text-sm font-bold ${r.percentage >= 80 ? "text-green-400" : r.percentage >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        {r.percentage?.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance records */}
            {detail?.attendance_records?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Attendance</h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {detail.attendance_records.slice(0, 15).map(r => {
                    const normalizedStatus = String(r.status || "").toLowerCase();
                    const badgeClass = normalizedStatus === "present"
                      ? "bg-green-500/20 text-green-400"
                      : normalizedStatus === "late"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400";

                    return (
                      <div key={r.attendance_id} className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-slate-900/40 px-3 py-2">
                        <div>
                          <p className="text-xs text-slate-300">{r.session_name || "Session"} · {r.course_title}</p>
                          <p className="text-xs text-slate-500">{r.session_date}</p>
                        </div>
                        <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${badgeClass}`}>
                          {r.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!detail?.quiz_results?.length && !detail?.attendance_records?.length && (
              <p className="text-slate-500 text-sm text-center py-6">No performance data available yet for this student.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
const StudentMonitoring = () => {
  const { tutorId } = useTutorAuth();
  const [students, setStudents] = useState([]);
  const [aiPredictions, setAiPredictions] = useState({});
  const [aiSummary, setAiSummary] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [trainingMsg, setTrainingMsg] = useState("");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortDesc, setSortDesc] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState("");

  // Load students + AI status
  useEffect(() => {
    if (!tutorId) return;
    const load = async () => {
      setLoading(true);
      const [sRes, statusRes] = await Promise.all([
        getTutorStudents(tutorId),
        getAIStatus(),
      ]);
      if (sRes.success) setStudents(sRes.students || []);
      else setError(sRes.message);
      if (statusRes) setModelStatus(statusRes);
      setLoading(false);
    };
    load();
  }, [tutorId]);

  // Load AI predictions if model is trained
  const loadAIPredictions = async () => {
    setAiLoading(true);
    const res = await predictAllStudents(tutorId);
    if (res.predictions) {
      const map = {};
      res.predictions.forEach(p => { map[p.student_id] = p; });
      setAiPredictions(map);
      setAiSummary(res.risk_summary);
    }
    setAiLoading(false);
  };

  useEffect(() => {
    if (modelStatus?.trained) loadAIPredictions();
  }, [modelStatus]);

  const handleTrain = async () => {
    setTrainingMsg("Training model…");
    setAiLoading(true);
    const res = await trainAIModel();
    if (res.accuracy_percent !== undefined) {
      const accuracy = typeof res.accuracy === "number"
        ? res.accuracy * 100
        : Number.parseFloat(res.accuracy_percent);
      setTrainingMsg(`Trained. Accuracy: ${Number.isFinite(accuracy) ? accuracy.toFixed(1) : "-"}%`);
      setModelStatus({ trained: true, accuracy: res.accuracy_percent });
      await loadAIPredictions();
    } else {
      setTrainingMsg(res.message || res.error || "Training failed.");
    }
    setAiLoading(false);
  };

  // ── Sort & filter ───────────────────────────────────────────
  const toggleSort = (col) => {
    if (sortBy === col) setSortDesc(d => !d);
    else { setSortBy(col); setSortDesc(false); }
  };

  const normalizeRisk = (value) => String(value || "").replace(/\s*Risk\s*$/i, "").trim();

  const filtered = students
    .filter(s => {
      const name = s.name || "";
      const email = s.email || "";
      const matchSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());

      const ai = aiPredictions[s.student_id];
      const studentRisk = normalizeRisk(s.risk_level || ai?.predicted_risk || "");
      const activeRisk = normalizeRisk(riskFilter);
      const matchRisk = riskFilter === "All" || studentRisk === activeRisk;
      return matchSearch && matchRisk;
    })
    .sort((a, b) => {
      let va, vb;
      if (sortBy === "name")       { va = a.name; vb = b.name; }
      else if (sortBy === "quiz")  { va = a.avg_quiz_score ?? -1; vb = b.avg_quiz_score ?? -1; }
      else if (sortBy === "att")   { va = a.attendance_percentage ?? -1; vb = b.attendance_percentage ?? -1; }
      else                         { va = a.name; vb = b.name; }

      if (typeof va === "string") return sortDesc ? vb.localeCompare(va) : va.localeCompare(vb);
      return sortDesc ? vb - va : va - vb;
    });

  // ── summary counts ─────────────────────────────────────────
  const avgQuiz = students.length
    ? (students.reduce((s, st) => s + (st.avg_quiz_score ?? 0), 0) / students.length).toFixed(1)
    : 0;
  const avgAtt = students.length
    ? (students.reduce((s, st) => s + (st.attendance_percentage ?? 0), 0) / students.length).toFixed(1)
    : 0;

  const SortIcon = ({ col }) =>
    sortBy === col ? (sortDesc ? <ChevronDown size={14} /> : <ChevronUp size={14} />) : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_35%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7 space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Tutor Dashboard</p>
          <h1 className="text-3xl font-bold">Student Monitoring</h1>
          <p className="text-slate-400 text-sm mt-1">{students.length} students enrolled across your courses</p>
        </div>
        <button
          onClick={() => { setLoading(true); getTutorStudents(tutorId).then(r => { if (r.success) setStudents(r.students); setLoading(false); }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-sm hover:bg-cyan-400/20 transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {/* ── Overview cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: students.length, icon: <Users size={20} className="text-cyan-300" />, colour: "border-cyan-400/25 shadow-cyan-400/10" },
          { label: "Avg Quiz Score", value: `${avgQuiz}%`, icon: <BookOpen size={20} className="text-purple-300" />, colour: "border-purple-400/25 shadow-purple-400/10" },
          { label: "Avg Attendance", value: `${avgAtt}%`, icon: <Activity size={20} className="text-green-300" />, colour: "border-green-400/25 shadow-green-400/10" },
          { label: "AI Predictions", value: Object.keys(aiPredictions).length, icon: <Brain size={20} className="text-pink-300" />, colour: "border-pink-400/25 shadow-pink-400/10" },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl border ${c.colour} bg-[#041225]/80 p-4 shadow-[0_0_18px] flex flex-col gap-2`}>
            <div className="flex items-center gap-2 text-slate-400 text-xs">{c.icon} {c.label}</div>
            <p className="text-2xl font-bold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── AI Section ── */}
      <div className="rounded-3xl border border-cyan-300/30 bg-[#041225]/80 p-5 shadow-[0_0_25px_rgba(34,211,238,0.3)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-purple-300" />
            <h2 className="text-lg font-semibold">AI Risk Prediction (Decision Tree)</h2>
            {modelStatus?.trained && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-400/30">
                Model Trained
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {trainingMsg && <p className="text-xs text-cyan-300">{trainingMsg}</p>}
            <button
              onClick={handleTrain}
              disabled={aiLoading}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
            >
              {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Brain size={14} />}
              {aiLoading ? "Processing…" : "Train / Refresh AI Model"}
            </button>
          </div>
        </div>

        {aiSummary && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Low Risk",    count: aiSummary.Low    ?? 0, cls: "border-green-400/30  bg-green-400/10  text-green-400"  },
              { label: "Medium Risk", count: aiSummary.Medium ?? 0, cls: "border-yellow-400/30 bg-yellow-400/10 text-yellow-400" },
              { label: "High Risk",   count: aiSummary.High   ?? 0, cls: "border-red-400/30    bg-red-400/10    text-red-400"    },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border ${s.cls} p-3 text-center`}>
                <p className="text-2xl font-bold">{s.count}</p>
                <p className="text-xs opacity-80 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        {!aiSummary && !aiLoading && (
          <p className="text-slate-500 text-sm">Train the model to see risk predictions for all students.</p>
        )}
      </div>

      {/* ── Filters & table ── */}
      <div className="rounded-3xl border border-cyan-300/20 bg-[#041225]/80 p-5 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-xl bg-slate-900/80 border border-slate-600 px-4 py-2.5 text-sm outline-none focus:border-cyan-400 placeholder-slate-500"
          />
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="rounded-xl bg-slate-900/80 border border-slate-600 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-cyan-300 gap-2">
            <RefreshCw size={18} className="animate-spin" /> Loading students…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No students found{search ? " matching your search" : ""}.</p>
            {!search && <p className="text-xs mt-1">Students will appear once they enrol in your courses.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                  {[
                    { label: "Student", col: "name" },
                    { label: "Courses", col: null },
                    { label: "Avg Quiz", col: "quiz" },
                    { label: "Attendance", col: "att" },
                    { label: "AI Risk", col: null },
                    { label: "", col: null },
                  ].map(h => (
                    <th
                      key={h.label}
                      className={`py-3 px-3 text-left font-semibold ${h.col ? "cursor-pointer select-none hover:text-slate-300" : ""}`}
                      onClick={() => h.col && toggleSort(h.col)}
                    >
                      <span className="flex items-center gap-1">{h.label} {h.col && <SortIcon col={h.col} />}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const ai = aiPredictions[s.student_id];
                  return (
                    <tr key={s.student_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                      {/* Name */}
                      <td className="py-3 px-3">
                        <p className="font-medium text-white">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </td>
                      {/* Courses */}
                      <td className="py-3 px-3">
                        <p className="text-slate-300 text-xs">{s.courses?.length ?? 0} course{s.courses?.length !== 1 ? "s" : ""}</p>
                      </td>
                      {/* Quiz */}
                      <td className="py-3 px-3">
                        {s.avg_quiz_score !== undefined && s.avg_quiz_score !== null ? (
                          <div>
                            <p className={`font-semibold ${s.avg_quiz_score >= 70 ? "text-green-400" : s.avg_quiz_score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                              {s.avg_quiz_score}%
                            </p>
                            <MiniBar
                              value={s.avg_quiz_score}
                              colour={s.avg_quiz_score >= 70 ? "bg-green-400" : s.avg_quiz_score >= 50 ? "bg-yellow-400" : "bg-red-400"}
                            />
                            <p className="text-xs text-slate-500 mt-0.5">{s.quiz_attempts} attempt{s.quiz_attempts !== 1 ? "s" : ""}</p>
                          </div>
                        ) : (
                          <p className="text-slate-600 text-xs">No data</p>
                        )}
                      </td>
                      {/* Attendance */}
                      <td className="py-3 px-3">
                        {s.attendance_percentage !== undefined && s.attendance_percentage !== null && s.attendance_total > 0 ? (
                          <div>
                            <p className={`font-semibold ${s.attendance_percentage >= 75 ? "text-green-400" : s.attendance_percentage >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                              {s.attendance_percentage}%
                            </p>
                            <MiniBar
                              value={s.attendance_percentage}
                              colour={s.attendance_percentage >= 75 ? "bg-green-400" : s.attendance_percentage >= 50 ? "bg-yellow-400" : "bg-red-400"}
                            />
                            <p className="text-xs text-slate-500 mt-0.5">{s.attendance_present}/{s.attendance_total} sessions</p>
                          </div>
                        ) : (
                          <p className="text-slate-600 text-xs">No records</p>
                        )}
                      </td>
                      {/* AI Risk */}
                      <td className="py-3 px-3">
                        {ai ? (
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${riskColour[ai.predicted_risk] || riskColour.Low}`}>
                            {riskIcon[ai.predicted_risk]}
                            {ai.predicted_risk}
                            {ai.confidence && <span className="opacity-60 ml-1">{(ai.confidence * 100).toFixed(0)}%</span>}
                          </div>
                        ) : aiLoading ? (
                          <span className="text-xs text-slate-500">Loading…</span>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>
                      {/* View */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/25 text-cyan-300 text-xs hover:bg-cyan-400/20 transition"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-slate-600 mt-3">Showing {filtered.length} of {students.length} students</p>
          </div>
        )}
      </div>

      {/* Student detail modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          tutorId={tutorId}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default StudentMonitoring;
