import {
  TrendingUp,
  BarChart3,
  AlertTriangle,
  ShieldCheck,
  CalendarCheck,
  BookOpen,
  Activity,
} from "lucide-react";

const studentPerformance = [
  { name: "Student A", score: 85 },
  { name: "Student B", score: 42 },
  { name: "Student C", score: 67 },
  { name: "Student D", score: 74 },
  { name: "Student E", score: 58 },
];

const weakStudents = ["Kasuni", "Nadeesha", "Tharushi"];
const averageStudents = ["Ishara", "Malith", "Sajith"];
const highPerformers = ["Chamari", "Hiran", "Nimali"];

const confusionData = [
  { topic: "Database Lesson", understood: 15, partial: 20, confused: 12 },
  { topic: "Programming Logic", understood: 12, partial: 18, confused: 20 },
  { topic: "Networking", understood: 24, partial: 8, confused: 4 },
];

const topicDifficulty = [
  { topic: "Programming Logic", confused: 70 },
  { topic: "Normalization", confused: 60 },
  { topic: "Networking", confused: 20 },
];

const attendanceData = [
  { name: "Student A", attendance: 95 },
  { name: "Student B", attendance: 40 },
  { name: "Student C", attendance: 82 },
];

const progressHistory = [
  { quiz: "Quiz 1", score: 40 },
  { quiz: "Quiz 2", score: 55 },
  { quiz: "Quiz 3", score: 70 },
];

const StudentMonitoring = () => {
  const averageScore = Math.round(
    studentPerformance.reduce((sum, student) => sum + student.score, 0) /
      studentPerformance.length
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#03111f,#020617)] text-white px-6 py-7">
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
            <p className="mt-2 text-3xl font-semibold text-amber-300">{weakStudents.length}</p>
          </div>
          <div className="rounded-3xl border border-cyan-400/20 bg-[#041225]/80 p-5 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
            <p className="text-sm text-slate-400">Attendance Risk</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">{attendanceData.filter((item) => item.attendance < 75).length}</p>
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
                <div key={student.name} className="flex items-center justify-between rounded-2xl bg-slate-900/70 px-4 py-4 border border-slate-700">
                  <div>
                    <p className="text-sm text-slate-400">{student.name}</p>
                    <p className="mt-1 text-lg font-semibold">{student.score}%</p>
                  </div>
                  <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-200 text-sm">
                    {student.score >= 75 ? "High" : student.score >= 50 ? "Average" : "Low"}
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
                  {weakStudents.map((name) => (
                    <li key={name}>• {name}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-slate-900/70 p-4 border border-slate-700">
                <p className="text-sm text-slate-400">Average</p>
                <ul className="mt-3 space-y-2 text-white">
                  {averageStudents.map((name) => (
                    <li key={name}>• {name}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-slate-900/70 p-4 border border-slate-700">
                <p className="text-sm text-slate-400">High Performers</p>
                <ul className="mt-3 space-y-2 text-white">
                  {highPerformers.map((name) => (
                    <li key={name}>• {name}</li>
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
                <div key={item.quiz} className="rounded-2xl bg-slate-900/70 px-4 py-4 border border-slate-700 flex items-center justify-between">
                  <p>{item.quiz}</p>
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
                <div key={item.name} className="rounded-2xl bg-slate-900/70 p-4 border border-slate-700 flex items-center justify-between">
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
            <p className="mt-3 text-white">Kasuni — Today</p>
            <p className="text-slate-400">Nadeesha — 10 days ago</p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 p-4 border border-slate-700">
            <p className="text-sm text-slate-400">Quiz Attempts</p>
            <p className="mt-3 text-white">132 total</p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 p-4 border border-slate-700">
            <p className="text-sm text-slate-400">Material Downloads</p>
            <p className="mt-3 text-white">48</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMonitoring;
