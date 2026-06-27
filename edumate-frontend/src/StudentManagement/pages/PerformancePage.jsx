import { Link } from 'react-router-dom'
import { TrendingUp, Calendar, ClipboardList } from 'lucide-react'
import SimpleBarChart from '../components/SimpleBarChart'
import { STUDENT_ROUTES } from '../studentRoutes'

export default function PerformancePage({
  quizHistory,
  attendanceRecords,
  courses,
  attendancePercentage,
  buildWeakAreasSummary
}) {
  const enrolled = courses.filter((c) => c.enrolled)
  const quizChartData = quizHistory.map((q) => ({
    label: q.quizTitle.length > 28 ? `${q.quizTitle.slice(0, 28)}…` : q.quizTitle,
    value: q.percentage
  }))

  const attendanceByCourse = enrolled.map((course) => {
    const records = attendanceRecords.filter((r) => r.courseId === course.id)
    const attended = records.filter((r) => r.status === 'present' || r.status === 'late').length
    const pct = records.length ? Math.round((attended / records.length) * 100) : 0
    return { label: course.id, value: pct }
  })

  const progressChartData = enrolled.map((c) => ({
    label: c.id,
    value: c.progress
  }))

  const presentDays = attendanceRecords.filter((r) => r.status === 'present').length
  const absentDays = attendanceRecords.filter((r) => r.status === 'absent').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Student Performance</h2>
        <p className="text-sm text-slate-400">Quiz history, attendance trends, and progress analytics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={18} className="text-cyan-400" />
            <h3 className="font-bold text-white">Quiz Marks Chart</h3>
          </div>
          {quizChartData.length > 0 ? (
            <SimpleBarChart data={quizChartData} unit="%" color="from-cyan-500 to-blue-500" />
          ) : (
            <p className="text-sm text-slate-500">No quiz data yet.</p>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-emerald-400" />
            <h3 className="font-bold text-white">Attendance Chart</h3>
          </div>
          {attendanceByCourse.length > 0 ? (
            <SimpleBarChart data={attendanceByCourse} unit="%" color="from-emerald-500 to-teal-400" />
          ) : (
            <p className="text-sm text-slate-500">Enroll in courses to track attendance.</p>
          )}
          <div className="mt-4 flex gap-4 text-xs text-slate-400">
            <span>Present: <strong className="text-emerald-400">{presentDays}</strong></span>
            <span>Absent: <strong className="text-rose-400">{absentDays}</strong></span>
            <span>Overall: <strong className="text-white">{attendancePercentage}%</strong></span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-purple-400" />
            <h3 className="font-bold text-white">Progress Chart</h3>
          </div>
          {progressChartData.length > 0 ? (
            <SimpleBarChart data={progressChartData} unit="%" color="from-purple-500 to-indigo-500" />
          ) : (
            <p className="text-sm text-slate-500">No enrolled courses.</p>
          )}
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20">
        <h3 className="font-bold text-amber-200 mb-2">Weak Topics</h3>
        <p className="text-sm text-amber-100">{buildWeakAreasSummary()}</p>
        <Link to={STUDENT_ROUTES.aiFeedback} className="inline-block mt-4 text-xs font-bold text-cyan-400 hover:underline">
          View AI recommendations →
        </Link>
      </div>

      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
        <h3 className="font-bold text-white mb-4">Quiz History</h3>
        <div className="space-y-2">
          {quizHistory.map((q) => (
            <div key={q.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-sm">
              <span className="text-slate-200">{q.quizTitle}</span>
              <span className="text-cyan-400 font-bold">{q.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
