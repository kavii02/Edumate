import React from 'react'
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import PageBackBar from './PageBackBar'
import './Student.css'

export default function AttendancePage({ attendanceRecords, courses, attendancePercentage, onBack, backLabel = 'Progress' }) {
  const presentCount = attendanceRecords.filter((r) => r.status === 'present').length
  const absentCount = attendanceRecords.filter((r) => r.status === 'absent').length
  const lateCount = attendanceRecords.filter((r) => r.status === 'late').length

  const courseStats = courses
    .filter((c) => c.enrolled)
    .map((course) => {
      const records = attendanceRecords.filter((r) => r.courseId === course.id)
      const present = records.filter((r) => r.status === 'present').length
      const total = records.length
      const pct = total > 0 ? Math.round((present / total) * 100) : 0
      return { ...course, records, present, total, pct }
    })

  const statusIcon = (status) => {
    if (status === 'present') return <CheckCircle size={16} className="text-emerald-400" />
    if (status === 'absent') return <XCircle size={16} className="text-rose-400" />
    return <Clock size={16} className="text-amber-400" />
  }

  const statusLabel = (status) => {
    if (status === 'present') return 'Present'
    if (status === 'absent') return 'Absent'
    return 'Late'
  }

  return (
    <div className="space-y-6">
      {onBack && <PageBackBar label={backLabel} onBack={onBack} />}
      <div>
        <h2 className="text-2xl font-bold text-white">Attendance History</h2>
        <p className="text-sm text-slate-400 max-w-2xl">View your session attendance records and overall percentage across enrolled courses.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900 text-center">
          <p className="text-3xl font-black text-emerald-400">{attendancePercentage}%</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Overall</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900 text-center">
          <p className="text-3xl font-black text-cyan-400">{presentCount}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Present</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900 text-center">
          <p className="text-3xl font-black text-amber-400">{lateCount}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Late</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900 text-center">
          <p className="text-3xl font-black text-rose-400">{absentCount}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Absent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={18} className="text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Session History</h3>
          </div>
          <div className="space-y-3">
            {[...attendanceRecords].reverse().map((record) => {
              const course = courses.find((c) => c.id === record.courseId)
              return (
                <div key={record.id} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-850">
                  <div className="flex items-start gap-3">
                    {statusIcon(record.status)}
                    <div>
                      <p className="text-sm font-semibold text-white">{record.session}</p>
                      <p className="text-xs text-slate-400">{course?.id} • {record.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    record.status === 'present' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' :
                    record.status === 'absent' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' :
                    'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                  }`}>
                    {statusLabel(record.status)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">By Course</h3>
          <div className="space-y-4">
            {courseStats.length > 0 ? courseStats.map((cs) => (
              <div key={cs.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-850">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{cs.id}</span>
                  <span className="text-sm font-bold text-cyan-400">{cs.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cs.pct}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">{cs.present} of {cs.total} sessions attended</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">Enroll in courses to track attendance.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
