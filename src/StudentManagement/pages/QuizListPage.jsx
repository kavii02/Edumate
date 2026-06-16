import { Link } from 'react-router-dom'
import { STUDENT_ROUTES } from '../studentRoutes'

export default function QuizListPage({ mockQuizzes, isQuizCompleted, adaptiveDifficulty }) {
  const getStatus = (quiz) => {
    if (isQuizCompleted(quiz.id)) return { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' }
    const due = new Date(quiz.dueDate)
    const now = new Date()
    if (due < now) return { label: 'Overdue', className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' }
    return { label: 'Pending', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' }
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

      <div className="space-y-4">
        {mockQuizzes.map((quiz) => {
          const status = getStatus(quiz)
          const done = isQuizCompleted(quiz.id)
          return (
            <div key={quiz.id} className="p-5 rounded-3xl bg-slate-950/70 border border-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${status.className}`}>{status.label}</span>
                    <span className="text-[10px] text-slate-500">Due: {quiz.dueDate}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                  <p className="text-sm text-slate-400">{quiz.questions.length} questions • {quiz.duration} • {quiz.category}</p>
                </div>
                {done ? (
                  <Link
                    to={STUDENT_ROUTES.result(quiz.id)}
                    className="shrink-0 px-5 py-2.5 rounded-2xl bg-purple-500/20 text-purple-200 text-sm font-bold border border-purple-500/30 hover:bg-purple-500/30 text-center"
                  >
                    View Result
                  </Link>
                ) : (
                  <Link
                    to={STUDENT_ROUTES.quiz(quiz.id)}
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
    </div>
  )
}
