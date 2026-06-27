import { Sparkles, BookOpen, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STUDENT_ROUTES } from '../studentRoutes'

export default function AIFeedbackPage({ getAISuggestions, buildWeakAreasSummary, quizHistory, handleAddRecommendationToPlanner }) {
  const suggestions = getAISuggestions()
  const weakTopics = buildWeakAreasSummary()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Feedback</h2>
        <p className="text-sm text-slate-400">Personalized suggestions based on quiz performance, lesson feedback, and study patterns.</p>
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/50 to-slate-950/80 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={22} className="text-purple-400" />
          <h3 className="text-lg font-bold text-white">Focus Areas</h3>
        </div>
        <p className="text-sm text-slate-300">{weakTopics}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold">Improvement Recommendations</h3>
        {suggestions.length === 0 ? (
          <p className="text-sm text-slate-500">You&apos;re on track — no urgent recommendations right now.</p>
        ) : (
          suggestions.map((s) => (
            <div key={s.topic} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900">
              <p className="font-semibold text-white">{s.topic}</p>
              <p className="text-xs text-amber-400 mt-1">Reason: {s.reason}</p>
              <p className="text-sm text-slate-400 mt-2">{s.recommendation}</p>
              <button
                type="button"
                onClick={() => handleAddRecommendationToPlanner(s)}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"
              >
                Add to Study Planner
              </button>
            </div>
          ))
        )}
      </div>

      {quizHistory.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">Per-Quiz AI Analysis</h3>
          <div className="space-y-3">
            {quizHistory.map((entry) => (
              <div key={entry.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <p className="text-sm font-semibold text-white">{entry.quizTitle} — {entry.percentage}%</p>
                <p className="text-xs text-slate-400 mt-1">{entry.feedback}</p>
                {entry.suggestedQuizzes?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.suggestedQuizzes.map((q) => (
                      <span key={q} className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{q}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link to={STUDENT_ROUTES.studyPlanner} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 hover:border-cyan-500/40">
          <BookOpen size={16} /> Study Planner
        </Link>
        <Link to={STUDENT_ROUTES.quizzes} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 hover:border-cyan-500/40">
          <ClipboardList size={16} /> Quiz Center
        </Link>
      </div>
    </div>
  )
}
