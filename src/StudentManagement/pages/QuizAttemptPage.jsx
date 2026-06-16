import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Clock, AlertTriangle } from 'lucide-react'
import FaceProctor from '../components/FaceProctor'
import { STUDENT_ROUTES } from '../studentRoutes'

function parseDuration(duration) {
  const match = duration?.match(/(\d+)/)
  return match ? parseInt(match[1], 10) * 60 : 600
}

export default function QuizAttemptPage({
  mockQuizzes,
  currentQuizQuestionIndex,
  quizSelectedAnswers,
  handleSelectQuizOption,
  handleSubmitQuizAnswers,
  handleQuizNext,
  handleQuizPrev,
  setActiveQuizObj,
  setCurrentQuizQuestionIndex,
  setQuizSelectedAnswers,
  setActiveQuizState,
  triggerToast
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const quiz = mockQuizzes.find((q) => q.id === id)
  const [secondsLeft, setSecondsLeft] = useState(() => parseDuration(quiz?.duration))
  const [showProctor, setShowProctor] = useState(true)
  const [violationMsg, setViolationMsg] = useState('')

  useEffect(() => {
    if (!quiz) return
    setActiveQuizObj(quiz)
    setCurrentQuizQuestionIndex(0)
    setQuizSelectedAnswers({})
    setActiveQuizState('active')
    setSecondsLeft(parseDuration(quiz.duration))
  }, [quiz, setActiveQuizObj, setCurrentQuizQuestionIndex, setQuizSelectedAnswers, setActiveQuizState])

  useEffect(() => {
    if (!quiz || violationMsg) return undefined
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer)
          handleSubmitQuizAnswers()
          navigate(STUDENT_ROUTES.result(quiz.id))
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [quiz, violationMsg, handleSubmitQuizAnswers, navigate])

  const handleViolation = (msg) => {
    setViolationMsg(msg)
    triggerToast?.(msg)
    setTimeout(() => navigate(STUDENT_ROUTES.quizzes), 2000)
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Quiz not found.</p>
        <Link to={STUDENT_ROUTES.quizzes} className="text-cyan-400 text-sm mt-4 inline-block">Back to quizzes</Link>
      </div>
    )
  }

  if (violationMsg) {
    return (
      <div className="p-8 rounded-3xl bg-rose-950/50 border border-rose-500/30 text-center">
        <AlertTriangle size={40} className="text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Quiz Closed</h2>
        <p className="text-sm text-rose-200 mt-2">{violationMsg}</p>
      </div>
    )
  }

  const question = quiz.questions[currentQuizQuestionIndex]
  const isLast = currentQuizQuestionIndex === quiz.questions.length - 1
  const hasAnswer = quizSelectedAnswers[currentQuizQuestionIndex] !== undefined
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  const submit = () => {
    handleSubmitQuizAnswers()
    navigate(STUDENT_ROUTES.result(quiz.id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
          <p className="text-sm text-slate-400">Question {currentQuizQuestionIndex + 1} of {quiz.questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${secondsLeft < 60 ? 'border-rose-500/50 bg-rose-500/10 text-rose-200' : 'border-slate-800 bg-slate-900 text-slate-200'}`}>
          <Clock size={16} />
          <span className="font-mono font-bold">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all" style={{ width: `${((currentQuizQuestionIndex + 1) / quiz.questions.length) * 100}%` }} />
      </div>

      <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 space-y-4">
        <p className="text-base text-slate-100 font-semibold">{question.q}</p>
        <div className="grid gap-3">
          {question.opts.map((option, idx) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelectQuizOption(idx)}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${quizSelectedAnswers[currentQuizQuestionIndex] === idx ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-900'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleQuizPrev} disabled={currentQuizQuestionIndex === 0} className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-bold text-slate-200 border border-slate-700 disabled:opacity-40">
          Previous
        </button>
        {!isLast ? (
          <button type="button" onClick={handleQuizNext} disabled={!hasAnswer} className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-40">
            Next Question
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={!hasAnswer} className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-40">
            Submit Quiz
          </button>
        )}
        <Link to={STUDENT_ROUTES.quizzes} className="rounded-2xl px-5 py-3 text-sm text-slate-400 hover:text-white flex items-center">
          Cancel
        </Link>
      </div>

      {showProctor && <FaceProctor onViolation={handleViolation} onClose={() => setShowProctor(false)} />}
    </div>
  )
}
