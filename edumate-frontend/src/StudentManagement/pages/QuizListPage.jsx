import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { STUDENT_ROUTES } from '../studentRoutes'

export default function QuizListPage({ mockQuizzes, isQuizCompleted, adaptiveDifficulty, isLoading, error }) {
  const getQuizId = (quiz) => quiz.quiz_id ?? quiz.id
  const getQuizTitle = (quiz) => quiz.quiz_title ?? quiz.title ?? 'Untitled Quiz'
  const getQuizDue = (quiz) => quiz.due_date ?? quiz.dueDate ?? ''
  const getQuestionCount = (quiz) => quiz.total_questions ?? quiz.questions?.length ?? 0
  const getQuizDuration = (quiz) => quiz.duration ?? quiz.duration_minutes ? `${quiz.duration_minutes} mins` : 'N/A'
  const getQuizCategory = (quiz) => quiz.subject ?? quiz.category ?? ''

  const getStatus = (quiz) => {
    const qid = getQuizId(quiz)
    if (isQuizCompleted(qid)) return { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' }
    const dueStr = getQuizDue(quiz)
    if (dueStr) {
      const due = new Date(dueStr)
      if (due < new Date()) return { label: 'Overdue', className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' }
    }
    return { label: 'Pending', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading quizzes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Quiz Center</h2>
          <p className="text-sm text-slate-400 max-w-2xl">Available assessments with due dates, status, and adaptive difficulty.</p>
        </div>
        {adaptiveDifficulty && (
          <div className="rounded-2xl bg-purple-500/10 border border-purple-500/30 px-4 py-2 text-sm">
            <span className="text-purple-300 font-semibold">Adaptive Mode: </span>
            <span className="text-white">{adaptiveDifficulty.label}</span>
          </div>
        )}
      </div>

      {(!mockQuizzes || mockQuizzes.length === 0) ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-sm">No quizzes available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockQuizzes.map((quiz) => {
            const qid = getQuizId(quiz)
            const status = getStatus(quiz)
            const done = isQuizCompleted(qid)
            const dueStr = getQuizDue(quiz)
            const questionCount = getQuestionCount(quiz)
            const duration = getQuizDuration(quiz)
            const category = getQuizCategory(quiz)

            return (
              <div key={qid} className="p-5 rounded-3xl bg-slate-950/70 border border-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${status.className}`}>{status.label}</span>
                      {dueStr && <span className="text-[10px] text-slate-500">Due: {dueStr}</span>}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{getQuizTitle(quiz)}</h3>
                    <p className="text-sm text-slate-400">
                      {questionCount > 0 && `${questionCount} questions`}
                      {questionCount > 0 && duration !== 'N/A' && ' • '}
                      {duration !== 'N/A' && duration}
                      {category && ` • ${category}`}
                    </p>
                  </div>
                  {done ? (
                    <Link
                      to={STUDENT_ROUTES.result(qid)}
                      className="shrink-0 px-5 py-2.5 rounded-2xl bg-purple-500/20 text-purple-200 text-sm font-bold border border-purple-500/30 hover:bg-purple-500/30 text-center"
                    >
                      View Result
                    </Link>
                  ) : (
                    <Link
                      to={STUDENT_ROUTES.quiz(qid)}
                      className="shrink-0 px-5 py-2.5 rounded-2xl bg-cyan-500 text-slate-950 text-sm font-bold hover:bg-cyan-400 text-center"
                    >
                      Start Quiz
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
