import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, Users, BookOpen,
  Target, CheckCircle, RefreshCw, Award, AlertTriangle,
} from "lucide-react";
import { getTutorAnalytics, getPerformanceSummary, getTopicDifficulty } from "../services/tutorApiService";
import { useTutorAuth } from "../context/TutorAuthContext";

function ScoreBar({ score, max = 100 }) {
  const pct = max > 0 ? Math.min(100, (score / max) * 100) : 0;
  const colour = pct >= 70 ? "#4ade80" : pct >= 50 ? "#fbbf24" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 rounded-full bg-slate-700/60">
        <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: colour }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right" style={{ color: colour }}>{score?.toFixed(1)}%</span>
    </div>
  );
}

function StatCard({ label, value, sub, icon, accent = "cyan" }) {
  const colours = {
    cyan: "border-cyan-400/25 shadow-cyan-400/10 text-cyan-300",
    purple: "border-purple-400/25 shadow-purple-400/10 text-purple-300",
    green: "border-green-400/25 shadow-green-400/10 text-green-300",
    pink: "border-pink-400/25 shadow-pink-400/10 text-pink-300",
  };
  return (
    <div className={`rounded-2xl border ${colours[accent]} bg-[#041225]/80 p-4 shadow-[0_0_18px]`}>
      <div className={`flex items-center gap-2 text-xs mb-2 opacity-80 ${colours[accent]}`}>{icon} {label}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

const TutorAnalyticsPage = () => {
  const { tutorId } = useTutorAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [perfData, setPerfData] = useState(null);
  const [topicData, setTopicData] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    const [res, perfRes, topicRes] = await Promise.all([
      getTutorAnalytics(tutorId),
      getPerformanceSummary(tutorId),
      getTopicDifficulty(tutorId),
    ]);
    if (res.success) {
      setData(res);
      if (res.courses?.length > 0) setSelected(res.courses[0].course_id);
    } else {
      setError(res.message || "Failed to load analytics.");
    }
    if (perfRes.success) setPerfData(perfRes);
    if (topicRes.success) setTopicData(topicRes.topics || []);
    setLoading(false);
  };

  useEffect(() => { if (tutorId) load(); }, [tutorId]);

  const selCourse = data?.courses?.find(c => c.course_id === selected);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.14),transparent_35%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7 space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-purple-300/70">Tutor Dashboard</p>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time performance data from your courses</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-400/30 bg-purple-400/10 text-purple-300 text-sm hover:bg-purple-400/20 transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40 text-purple-300 gap-2">
          <RefreshCw size={18} className="animate-spin" /> Loading analytics…
        </div>
      ) : (
        <>
          {/* Overview cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Courses"       value={data?.overview?.total_courses ?? 0}   icon={<BookOpen size={16} />}   accent="cyan" />
            <StatCard label="Total Students"      value={data?.overview?.total_students ?? 0}   icon={<Users size={16} />}      accent="purple" />
            <StatCard label="Quiz Attempts"       value={data?.overview?.total_quiz_attempts ?? 0} icon={<Target size={16} />}  accent="green" />
            <StatCard
              label="Avg Quiz Score"
              value={`${data?.overview?.overall_avg_score?.toFixed(1) ?? 0}%`}
              icon={<Award size={16} />}
              accent="pink"
              sub="Across all quizzes"
            />
          </div>

          {/* Course selector + detail */}
          {data?.courses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Course list */}
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Courses</h2>
                {data.courses.map(c => (
                  <button
                    key={c.course_id}
                    onClick={() => setSelected(c.course_id)}
                    className={`w-full text-left rounded-2xl border p-4 transition ${
                      selected === c.course_id
                        ? "border-purple-400/50 bg-purple-500/15 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                        : "border-slate-700/50 bg-[#041225]/80 hover:border-slate-600"
                    }`}
                  >
                    <p className="font-medium text-white text-sm leading-snug">{c.course_title}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users size={10} /> {c.enrollment_count} students
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <CheckCircle size={10} /> {c.attendance_rate}% att.
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Course detail */}
              <div className="md:col-span-2 rounded-3xl border border-purple-400/25 bg-[#041225]/80 p-5 shadow-[0_0_25px_rgba(139,92,246,0.2)]">
                {selCourse ? (
                  <>
                    <h2 className="text-lg font-bold text-white mb-1">{selCourse.course_title}</h2>
                    <div className="flex gap-4 flex-wrap mb-5">
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Users size={12} /> {selCourse.enrollment_count} enrolled</span>
                      <span className={`text-xs flex items-center gap-1 font-semibold ${selCourse.attendance_rate >= 75 ? "text-green-400" : selCourse.attendance_rate >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                        <CheckCircle size={12} /> {selCourse.attendance_rate}% attendance
                      </span>
                    </div>

                    {/* Quiz breakdown */}
                    {selCourse.quizzes?.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Quiz Performance</h3>
                        <div className="space-y-4">
                          {selCourse.quizzes.map(q => (
                            <div key={q.quiz_id} className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-white">{q.quiz_title}</p>
                                <span className="text-xs text-slate-500">{q.attempts} attempt{q.attempts !== 1 ? "s" : ""}</span>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                                  <span>Average Score</span>
                                  <span>{q.avg_score?.toFixed(1)}%</span>
                                </div>
                                <ScoreBar score={q.avg_score} />
                              </div>
                              <div className="flex justify-between mt-2 text-xs text-slate-600">
                                <span>Min: <span className="text-red-400">{q.min_score?.toFixed(1)}%</span></span>
                                <span>Max: <span className="text-green-400">{q.max_score?.toFixed(1)}%</span></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No quizzes created for this course yet.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-500 text-sm">Select a course to view its analytics.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-700/40 bg-[#041225]/80 p-12 text-center">
              <BarChart3 size={48} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">No courses found. Create and manage courses to see analytics here.</p>
            </div>
          )}
          {/* Performance Risk Summary */}
          {perfData && (
            <div className="rounded-3xl border border-amber-400/20 bg-[#041225]/80 p-5 shadow-[0_0_18px_rgba(251,191,36,0.15)]">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" /> Student Risk Distribution
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Low Risk", count: perfData.risk_summary?.Low ?? 0, colour: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
                  { label: "Medium Risk", count: perfData.risk_summary?.Medium ?? 0, colour: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
                  { label: "High Risk", count: perfData.risk_summary?.High ?? 0, colour: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
                ].map(({ label, count, colour, bg }) => (
                  <div key={label} className={`rounded-2xl border ${bg} p-4 text-center`}>
                    <p className={`text-2xl font-bold ${colour}`}>{count}</p>
                    <p className="text-xs text-slate-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              {perfData.records?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-700">
                        <th className="text-left pb-2">Student</th>
                        <th className="text-left pb-2">Course</th>
                        <th className="text-right pb-2">Quiz</th>
                        <th className="text-right pb-2">Attend.</th>
                        <th className="text-right pb-2">Assign.</th>
                        <th className="text-right pb-2">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {perfData.records.slice(0, 10).map((r) => (
                        <tr key={r.performance_id} className="hover:bg-slate-900/30">
                          <td className="py-2 text-white">{r.student_name}</td>
                          <td className="py-2 text-slate-400 max-w-[120px] truncate">{r.course_title}</td>
                          <td className="py-2 text-right">{r.quiz_score.toFixed(1)}%</td>
                          <td className="py-2 text-right">{r.attendance_percentage.toFixed(1)}%</td>
                          <td className="py-2 text-right">{r.assignment_score.toFixed(1)}%</td>
                          <td className={`py-2 text-right font-semibold ${ r.risk_level === "High" ? "text-red-400" : r.risk_level === "Medium" ? "text-yellow-400" : "text-green-400" }`}>
                            {r.risk_level}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {perfData.total > 10 && (
                    <p className="text-slate-600 text-xs mt-2 text-center">Showing 10 of {perfData.total} records</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Topic Difficulty */}
          {topicData.length > 0 && (
            <div className="rounded-3xl border border-cyan-400/20 bg-[#041225]/80 p-5 shadow-[0_0_18px_rgba(34,211,238,0.15)]">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-cyan-400" /> Topic Difficulty Analysis
              </h2>
              <div className="space-y-3">
                {topicData.map((t) => (
                  <div key={t.id} className="flex items-center gap-4">
                    <p className="text-sm text-slate-300 w-40 flex-shrink-0 truncate">{t.topic_name}</p>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-slate-700/60">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, t.difficulty_score * 100)}%`,
                            background: t.difficulty_score >= 0.7 ? "#f87171" : t.difficulty_score >= 0.4 ? "#fbbf24" : "#4ade80",
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 w-20 text-right">
                      Acc: {(t.avg_accuracy * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TutorAnalyticsPage;
