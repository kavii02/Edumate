import { useState, useEffect } from 'react'
import { Sparkles, BookOpen, ClipboardList, ShieldAlert, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STUDENT_ROUTES } from '../studentRoutes'

export default function AIFeedbackPage({
  getAISuggestions,
  buildWeakAreasSummary,
  quizHistory,
  handleAddRecommendationToPlanner,
  student,
  token
}) {
  const suggestions = getAISuggestions()
  const weakTopics = buildWeakAreasSummary()
  const [riskData, setRiskData] = useState(null)
  const [loadingRisk, setLoadingRisk] = useState(false)

  const studentId = student?.student_id || parseInt(localStorage.getItem('edumate_student_id') || '1', 10)

  useEffect(() => {
    if (!studentId) return
    setLoadingRisk(true)
    fetch(`http://localhost:5000/api/ai/predict/${studentId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setRiskData(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRisk(false))
  }, [studentId])

  const getRiskBadge = (risk) => {
    switch ((risk || '').toLowerCase()) {
      case 'low':
        return {
          label: 'Low Risk — On Track',
          color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: <CheckCircle2 size={16} className="text-emerald-400" />,
          desc: 'Your learning metrics indicate strong grasp of concepts with high retention probability.'
        }
      case 'high':
        return {
          label: 'High Risk — Support Recommended',
          color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          icon: <ShieldAlert size={16} className="text-rose-400" />,
          desc: 'Decision Tree has identified critical gaps. Focus on weak topics and reach out to your tutor or peer mentors.'
        }
      default:
        return {
          label: 'Medium Risk — Steady Progress',
          color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: <AlertTriangle size={16} className="text-amber-400" />,
          desc: 'Performance is satisfactory. Regular quiz practice is advised to secure top grades in upcoming A/L assessments.'
        }
    }
  }

  const riskBadge = getRiskBadge(riskData?.predicted_risk)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Feedback</h2>
        <p className="text-sm text-slate-400">Personalized suggestions based on quiz performance, lesson feedback, and study patterns.</p>
      </div>

      {riskData && (
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-850 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Cpu size={22} className="text-cyan-400" />
              <div>
                <h3 className="text-lg font-bold text-white">AI Academic Risk Assessment</h3>
                <p className="text-xs text-slate-400">Scikit-learn Decision Tree Classifier Prediction</p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${riskBadge.color}`}>
              {riskBadge.icon}
              <span>{riskBadge.label}</span>
            </div>
          </div>
          <p className="text-sm text-slate-300 mb-4">{riskBadge.desc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider block">Model Confidence</span>
              <strong className="text-white text-sm">{Math.round((riskData.confidence || 0) * 100)}%</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider block">Input Quiz Score</span>
              <strong className="text-cyan-300 text-sm">{riskData.input_features?.quiz_score ?? '—'}%</strong>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider block">Attendance Rate</span>
              <strong className="text-emerald-300 text-sm">{riskData.input_features?.attendance_percentage ?? '—'}%</strong>
            </div>
          </div>
        </div>
      )}

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
