import React from 'react'
import { Award, TrendingUp, Target, Zap, CheckCircle, Clock, AlertCircle, MessageSquare, ClipboardList } from 'lucide-react'
import Leaderboard from './Leaderboard'
import './Student.css'

export default function ProgressPage({
  studentProfile,
  points,
  badges,
  courses,
  confusionFeedbacks,
  quizHistory = [],
  getRankInfo,
  buildWeakAreasSummary,
  leaderboardEntries,
  attendancePercentage,
  openSubPage,
  openCommunity
}) {
  const enrolledCourses = courses.filter((c) => c.enrolled)
  const completedCourses = enrolledCourses.filter((c) => c.progress >= 100)
  const inProgressCourses = enrolledCourses.filter((c) => c.progress < 100)
  const rankInfo = getRankInfo()
  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length)
    : 0

  const levelStyles = {
    beginner: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    intermediate: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    expert: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Progress</h2>
          <p className="text-sm text-slate-400">Track performance, rankings, and learning insights.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => openSubPage('quizzes', 'progress')} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors">
            Quiz Center
          </button>
          <button type="button" onClick={() => openSubPage('planner', 'progress')} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors">
            Study Planner
          </button>
          <button type="button" onClick={() => openSubPage('attendance', 'progress')} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors">
            Attendance ({attendancePercentage}%)
          </button>
          <button type="button" onClick={() => openCommunity('peers')} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-purple-500/40 hover:text-purple-300 transition-colors">
            Community
          </button>
        </div>
      </div>

      {/* Current Rank & Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <Zap size={24} className="text-yellow-400" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Skill Points</p>
              <h3 className="text-3xl font-black text-white">{points}</h3>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong>Current Rank:</strong> <span className="text-2xl">{rankInfo.currentEmoji}</span> <span className="text-cyan-400 font-semibold">{rankInfo.current}</span></p>
            <p><strong>Next Rank:</strong> <span className="text-2xl">{rankInfo.nextEmoji}</span> <span className="text-emerald-400">{rankInfo.next}</span></p>
            <p><strong>Points to Next:</strong> <span className="text-yellow-400 font-semibold">{rankInfo.nextPoints - points}</span></p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <TrendingUp size={24} className="text-cyan-400" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">Overall Progress</p>
              <h3 className="text-3xl font-black text-white">{avgProgress}%</h3>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong>Courses Enrolled:</strong> <span className="text-cyan-400 font-semibold">{enrolledCourses.length}</span></p>
            <p><strong>In Progress:</strong> <span className="text-amber-400">{inProgressCourses.length}</span></p>
            <p><strong>Completed:</strong> <span className="text-emerald-400">{completedCourses.length}</span></p>
          </div>
        </div>
      </div>

      {/* Achievements & Badges */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Award size={20} className="text-yellow-400" />
          <h3 className="text-lg font-bold text-white">Your Achievements</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all ${badge.unlocked
                ? 'bg-slate-900/80 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                : 'bg-slate-950/60 border-slate-800 opacity-50'
              }`}
            >
              <div className="text-4xl mb-3">{badge.icon}</div>
              <h4 className="font-semibold text-white mb-1">{badge.name}</h4>
              <p className="text-xs text-slate-400">{badge.desc}</p>
              {badge.unlocked && (
                <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold">
                  <CheckCircle size={12} />
                  Unlocked
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Course Progress Overview */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Target size={20} className="text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Course Progress</h3>
        </div>
        <div className="space-y-4">
          {enrolledCourses.length > 0 ? (
            enrolledCourses.map((course) => (
              <div key={course.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">{course.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{course.tutor}</p>
                  </div>
                  <span className="text-sm font-bold text-cyan-400">{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No enrolled courses yet. Start by exploring the course library!</p>
            </div>
          )}
        </div>
      </div>

      <Leaderboard
        leaderboardEntries={leaderboardEntries}
        studentProfile={studentProfile}
        currentRankInfo={rankInfo}
      />

      {/* Quiz Performance & Feedback */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList size={20} className="text-purple-400" />
          <h3 className="text-lg font-bold text-white">Quiz Performance & Feedback</h3>
        </div>
        {quizHistory.length > 0 ? (
          <div className="space-y-4">
            {quizHistory.map((entry) => (
              <div key={entry.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{entry.quizTitle}</h4>
                    <p className="text-xs text-slate-500 mt-1">{entry.date} • {entry.courseId} • {entry.percentage}% • +{entry.pointsAwarded} XP</p>
                  </div>
                  {entry.level && (
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${levelStyles[entry.level]}`}>
                      {entry.level}
                    </span>
                  )}
                </div>
                {entry.feedback && (
                  <p className="text-xs text-slate-300 mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-850">{entry.feedback}</p>
                )}
                {entry.suggestedQuizzes?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Suggested quizzes for your level</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.suggestedQuizzes.map((title) => (
                        <span key={title} className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">
            <p className="text-sm">No quiz results yet. Complete a classroom quiz to see personalized feedback here.</p>
            <button
              type="button"
              onClick={() => openSubPage('quizzes', 'progress')}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400"
            >
              Go to Quiz Center
            </button>
          </div>
        )}
      </div>

      {/* Lesson Feedback Summary */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare size={20} className="text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Lesson Understanding Feedback</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {courses.filter((c) => c.enrolled).map((course) => {
            const feedback = confusionFeedbacks[course.id]
            return (
              <div key={course.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <p className="text-sm font-semibold text-white">{course.id}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{course.title}</p>
                <p className={`text-xs font-bold mt-2 ${
                  feedback === 'Understood' ? 'text-emerald-400' :
                  feedback === 'Partially Understood' ? 'text-amber-400' :
                  feedback === 'Confused' ? 'text-rose-400' :
                  'text-slate-500'
                }`}>
                  {feedback || 'Not submitted yet'}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weak Areas & Recommendations */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle size={20} className="text-amber-400" />
          <h3 className="text-lg font-bold text-white">Focus Areas</h3>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-sm text-amber-100">
          <p className="font-semibold mb-2">Recommended focus: {buildWeakAreasSummary()}</p>
          <p className="text-xs text-amber-200 opacity-75">
            Based on your learning patterns and assessment feedback, we recommend prioritizing these areas to improve your overall performance.
          </p>
        </div>
      </div>

      {/* Learning Goals */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Target size={20} className="text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Learning Goals</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-emerald-500/20">
            <h4 className="font-semibold text-emerald-300 mb-2">Short Term</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Complete current course modules</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Achieve 80% on next assessment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Join peer study sessions</span>
              </li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-cyan-500/20">
            <h4 className="font-semibold text-cyan-300 mb-2">Long Term</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <Target size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Complete all A/L courses</span>
              </li>
              <li className="flex items-start gap-2">
                <Target size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Reach Code Titan rank</span>
              </li>
              <li className="flex items-start gap-2">
                <Target size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Master all skill badges</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-cyan-400 mb-1">{courses.filter(c => c.enrolled).length}</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Active Courses</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-emerald-400 mb-1">{badges.filter(b => b.unlocked).length}</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Badges Earned</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">{Math.floor(points / 100)}</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Milestones Hit</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-amber-400 mb-1">{enrolledCourses.length > 0 ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length) : 0}%</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Avg Progress</p>
        </div>
      </div>
    </div>
  )
}
