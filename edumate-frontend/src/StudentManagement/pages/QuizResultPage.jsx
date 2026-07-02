import { useParams, Link } from 'react-router-dom'
import { STUDENT_ROUTES } from '../studentRoutes'

const levelStyles = {
  beginner: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  intermediate: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  expert: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
}

export default function QuizResultPage({ quizHistory, mockQuizzes }) {
  const { id } = useParams()
  const result = quizHistory.find(
    (h) => String(h.quiz_id) === String(id) || String(h.quizId) === String(id)
  )
  const quiz = (mockQuizzes || []).find(
    (q) => String(q.quiz_id) === String(id) || String(q.id) === String(id)
  )

  if (!result) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-400">No result found for this quiz. Complete the quiz first.</p>
        <Link to={STUDENT_ROUTES.quiz(id)} className="inline-block px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 text-sm font-bold">
          Take Quiz
        </Link>
      </div>
    )
  }

  const totalCount = result.total_questions ?? result.totalCount ?? (quiz?.questions?.length ?? 0)
  const correctCount = result.score ?? result.correctCount ?? Math.round((result.percentage / 100) * totalCount)
  const wrongCount = totalCount - correctCount

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Quiz Result</h2>
        <p className="text-sm text-slate-400">{result.quiz_title ?? result.quizTitle ?? 'Quiz'}</p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-950/80 border border-slate-800 text-center">
        <p className="text-5xl font-black text-cyan-400">{result.percentage}%</p>
        <p className="text-sm text-slate-400 mt-2">Score</p>
        {result.level && (
          <span className={`inline-block mt-4 text-xs font-bold uppercase px-3 py-1 rounded-full border ${levelStyles[result.level] || ''}`}>
            {result.level} level
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-2xl font-bold text-emerald-300">{correctCount}</p>
          <p className="text-xs text-slate-400">Correct Answers</p>
        </div>
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
          <p className="text-2xl font-bold text-rose-300">{wrongCount}</p>
          <p className="text-xs text-slate-400">Wrong Answers</p>
        </div>
      </div>

      {result.feedback && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
          <div>
            <p className="text-sm font-semibold text-amber-100 mb-1">AI Feedback</p>
            <p className="text-sm text-amber-200/90">{result.feedback}</p>
          </div>
          <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-amber-200 text-sm">
            <span className="font-medium flex items-center gap-1.5">
              ⚡ Points Awarded:
            </span>
            <span className="font-black text-amber-400">+{result.pointsAwarded ?? (correctCount * 50) ?? 0} pts</span>
          </div>
        </div>
      )}

      {result.suggestedQuizzes?.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <p className="text-sm font-semibold text-white mb-2">Recommended Material / Quizzes</p>
          <ul className="space-y-2">
            {result.suggestedQuizzes.map((title) => (
              <li key={title} className="text-sm text-slate-300 flex items-center gap-2">
                <span className="text-cyan-400">→</span> {title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link to={STUDENT_ROUTES.performance} className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold">
          View Performance
        </Link>
        <Link to={STUDENT_ROUTES.quizzes} className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700">
          Back to Quizzes
        </Link>
      </div>
    </div>
  )
}
