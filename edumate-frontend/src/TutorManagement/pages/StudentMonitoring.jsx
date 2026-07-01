import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  BarChart3,
  AlertTriangle,
  ShieldCheck,
  CalendarCheck,
  BookOpen,
  Activity,
} from "lucide-react";
import { useTutorAuth } from "../context/TutorAuthContext";
import { getStudentMonitoring } from "../services/tutorApiService";

const emptyMonitoring = {
  summary: {
    total_students: 0,
    average_quiz_score: 0,
    average_attendance: 0,
    weak_students: 0,
    average_students: 0,
    high_performers: 0,
    attendance_risk: 0,
  },
  student_performance: [],
  weak_students: [],
  average_students: [],
  high_performers: [],
  attendance_risk_students: [],
  attendance_data: [],
  progress_history: [],
  confusion_data: [],
  topic_difficulty: [],
  activity_overview: {
    last_login: [],
    quiz_attempts: 0,
    material_downloads: 0,
  },
};

const StudentMonitoring = () => {
  const { tutorId } = useTutorAuth();
  const [monitoring, setMonitoring] = useState(emptyMonitoring);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tutorId) {
      setLoading(false);
      setError("Tutor session not found.");
      return;
    }

    let active = true;

    const loadMonitoring = async () => {
      setLoading(true);
      setError("");

      const response = await getStudentMonitoring(tutorId);
      if (!active) return;

      if (response.success) {
        setMonitoring(response.monitoring || emptyMonitoring);
      } else {
        setMonitoring(emptyMonitoring);
        setError(response.message || "Failed to load student monitoring data.");
      }

      setLoading(false);
    };

    loadMonitoring();

    return () => {
      active = false;
    };
  }, [tutorId]);

  const summary = monitoring.summary || emptyMonitoring.summary;
  const studentPerformance = monitoring.student_performance || [];
  const weakStudents = monitoring.weak_students || [];
  const averageStudents = monitoring.average_students || [];
  const highPerformers = monitoring.high_performers || [];
  const confusionData = monitoring.confusion_data || [];
  const topicDifficulty = monitoring.topic_difficulty || [];
  const attendanceData = monitoring.attendance_data || [];
  const progressHistory = monitoring.progress_history || [];

  const averageScore = useMemo(() => summary.average_quiz_score || 0, [summary.average_quiz_score]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
        <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-8 shadow-[0_0_25px_rgba(34,211,238,0.35)]">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Student Monitoring</p>
          <h1 className="mt-3 text-3xl font-bold">Loading monitoring data...</h1>
          <p className="mt-2 text-slate-300">Fetching quiz and attendance analytics from the backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
      {error ? (
        <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-amber-100">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">
            Student Monitoring
          </p>
          <h1 className="text-3xl font-bold">Monitor student progress</h1>
          <p className="mt-2 text-slate-300 max-w-2xl">
            Track performance, detect weak students, monitor attendance, and
            spot topic difficulties so you can support every learner.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-cyan-400/20 bg-[#041225]/80 p-5 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
            <p className="text-sm text-slate-400">Average Score</p>
            <p className="mt-2 text-3xl font-semibold text-white">{averageScore}%</p>
          </div>
          <div className="rounded-3xl border border-cyan-400/20 bg-[#041225]/80 p-5 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
            <p className="text-sm text-slate-400">Weak Students</p>
            <p className="mt-2 text-3xl font-semibold text-amber-300">{summary.weak_students}</p>
          </div>
          <div className="rounded-3xl border border-cyan-400/20 bg-[#041225]/80 p-5 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
            <p className="text-sm text-slate-400">Attendance Risk</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{summary.attendance_risk}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-6 shadow-[0_0_25px_rgba(34,211,238,0.35)]">
            <div className="flex items-center gap-3 mb-5">
              <BarChart3 className="text-cyan-300" />
              <div>
                <h2 className="text-xl font-semibold">View Student Performance</h2>
                <p className="text-sm text-slate-400">Quiz marks, averages, and comparisons.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {studentPerformance.map((student) => (
                <div key={student.student_id} className="flex items-center justify-between rounded-2xl bg-slate-900/70 px-4 py-4 border border-slate-700">
                  <div>
                    <p className="text-sm text-slate-400">{student.name}</p>
                    <p className="mt-1 text-lg font-semibold">{student.quiz_average}%</p>
                  </div>
                  <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-200 text-sm">
                    {student.category === "high" ? "High" : student.category === "average" ? "Average" : "Low"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-6 shadow-[0_0_25px_rgba(34,211,238,0.35)]">
            <div className="flex items-center gap-3 mb-5">
              <AlertTriangle className="text-amber-300" />
              <div>
                <h2 className="text-xl font-semibold">Weak Student Detection</h2>
                <p className="text-sm text-slate-400">Students identified by performance and attendance.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-900/70 p-4 border border-slate-700">
                <p className="text-sm text-slate-400">At Risk</p>
                <ul className="mt-3 space-y-2 text-white">
                  {weakStudents.map((student) => (
                    <li key={student.student_id}>• {student.name}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-slate-900/70 p-4 border border-slate-700">
                <p className="text-sm text-slate-400">Average</p>
                <ul className="mt-3 space-y-2 text-white">
                  {averageStudents.map((student) => (
                    <li key={student.student_id}>• {student.name}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-slate-900/70 p-4 border border-slate-700">
                <p className="text-sm text-slate-400">High Performers</p>
                <ul className="mt-3 space-y-2 text-white">
                  {highPerformers.map((student) => (
                    <li key={student.student_id}>• {student.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-6 shadow-[0_0_25px_rgba(34,211,238,0.35)]">
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp className="text-emerald-300" />
              <div>
                <h2 className="text-xl font-semibold">Track Student Progress</h2>
                <p className="text-sm text-slate-400">Improvement over time and quiz history.</p>
              </div>
            </div>

            <div className="space-y-4">
              {progressHistory.map((item) => (
                <div key={`${item.quiz}-${item.attempted_at || item.student_name}`} className="rounded-2xl bg-slate-900/70 px-4 py-4 border border-slate-700 flex items-center justify-between gap-3">
                  <div>
                    <p>{item.quiz}</p>
                    <p className="text-sm text-slate-400">{item.student_name}</p>
                  </div>
                  <p className="font-semibold text-white">{item.score}%</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-6 shadow-[0_0_25px_rgba(34,211,238,0.35)]">
            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck className="text-cyan-300" />
              <div>
                <h2 className="text-xl font-semibold">Confusion Analysis</h2>
                <p className="text-sm text-slate-400">See lesson clarity and revision needs.</p>
              </div>
            </div>

            <div className="space-y-4">
              {confusionData.map((item) => (
                <div key={item.topic} className="rounded-2xl bg-slate-900/70 p-4 border border-slate-700">
                  <p className="text-sm text-slate-400">{item.topic}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="font-semibold text-white">{item.understood}</p>
                      <p className="text-slate-400">Understood</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.partial}</p>
                      <p className="text-slate-400">Partial</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.confused}</p>
                      <p className="text-slate-400">Confused</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-6 shadow-[0_0_25px_rgba(34,211,238,0.35)]">
            <div className="flex items-center gap-3 mb-5">
              <CalendarCheck className="text-cyan-300" />
              <div>
                <h2 className="text-xl font-semibold">Attendance Monitoring</h2>
                <p className="text-sm text-slate-400">Quick view of attendance risks.</p>
              </div>
            </div>

            <div className="space-y-3">
              {attendanceData.map((item) => (
                <div key={item.student_id} className="rounded-2xl bg-slate-900/70 p-4 border border-slate-700 flex items-center justify-between">
                  <p>{item.name}</p>
                  <p className={item.attendance < 60 ? "text-rose-400" : "text-emerald-300"}>{item.attendance}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-6 shadow-[0_0_25px_rgba(34,211,238,0.35)]">
            <div className="flex items-center gap-3 mb-5">
              <BookOpen className="text-cyan-300" />
              <div>
                <h2 className="text-xl font-semibold">Topic Difficulty</h2>
                <p className="text-sm text-slate-400">Topics where students need more support.</p>
              </div>
            </div>

            <div className="space-y-4">
              {topicDifficulty.map((item) => (
                <div key={item.topic}>
                  <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                    <span>{item.topic}</span>
                    <span>{item.confused}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900/80">
                    <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${item.confused}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 rounded-3xl border border-cyan-300/50 bg-[#041225]/80 p-6 shadow-[0_0_25px_rgba(34,211,238,0.35)]">
        <div className="flex items-center gap-3 mb-5">
          <Activity className="text-cyan-300" />
          <div>
            <h2 className="text-xl font-semibold">Student Activity Overview</h2>
            <p className="text-sm text-slate-400">Light summary of logins, quiz attempts, and course activity.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-900/70 p-4 border border-slate-700">
            <p className="text-sm text-slate-400">Last Login</p>
            {monitoring.activity_overview.last_login.length > 0 ? (
              monitoring.activity_overview.last_login.map((entry) => (
                <p key={entry} className="mt-3 text-white">{entry}</p>
              ))
            ) : (
              <p className="mt-3 text-slate-400">No recent activity</p>
            )}
          </div>
          <div className="rounded-2xl bg-slate-900/70 p-4 border border-slate-700">
            <p className="text-sm text-slate-400">Quiz Attempts</p>
            <p className="mt-3 text-white">{monitoring.activity_overview.quiz_attempts} total</p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 p-4 border border-slate-700">
            <p className="text-sm text-slate-400">Material Downloads</p>
            <p className="mt-3 text-white">{monitoring.activity_overview.material_downloads}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMonitoring;
