import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Clock, AlertTriangle, Loader2 } from 'lucide-react'
import FaceProctor from '../components/FaceProctor'
import { STUDENT_ROUTES } from '../studentRoutes'
import ConfirmationModal from '../components/ConfirmationModal'

function parseDuration(duration) {
  const match = duration?.match(/(\d+)/)
  return match ? parseInt(match[1], 10) * 60 : 600
}

export default function QuizAttemptPage({
  student,
  token,
  onQuizSubmitted,
  triggerToast
}) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(600)
  const [showProctor, setShowProctor] = useState(true)
  const [violationMsg, setViolationMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    let active = true
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`http://localhost:5000/api/quiz/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })
        const data = await response.json()
        if (!active) return
        if (!response.ok) {
          setError(data.message || 'Failed to fetch quiz details.')
        } else {
          setQuiz(data.quiz)
          setQuestions(data.questions || [])
          setSecondsLeft(parseDuration(data.quiz?.duration || data.quiz?.duration_minutes?.toString() + ' mins'))
        }
      } catch {
        if (!active) return
        setError('Unable to fetch quiz from server.')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchQuiz()
    return () => { active = false }
  }, [id, token])

  const submitAnswers = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const mappedAnswers = {}
      questions.forEach((q, idx) => {
        const selectedIdx = selectedAnswers[idx]
        if (selectedIdx !== undefined) {
          mappedAnswers[q.question_id] = `option${selectedIdx + 1}`
        }
      })

      const studentId = student?.student_id || parseInt(localStorage.getItem('edumate_student_id') || '1')
      const response = await fetch('http://localhost:5000/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          student_id: studentId,
          quiz_id: quiz?.quiz_id,
          answers: mappedAnswers
        })
      })

      const data = await response.json()
      if (!response.ok) {
        triggerToast?.(data.message || 'Submission failed.')
      } else {
        triggerToast?.('Quiz submitted successfully!')
        onQuizSubmitted?.(data.result)
        navigate(STUDENT_ROUTES.result(id))
      }
    } catch {
      triggerToast?.('Error submitting answers to server.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!quiz || violationMsg || loading || submitting) return undefined
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer)
          submitAnswers()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [quiz, violationMsg, loading, submitting])

  const handleViolation = (msg) => {
    setViolationMsg(msg)
    triggerToast?.(msg)
    setTimeout(() => navigate(STUDENT_ROUTES.quizzes), 2000)
  }

  const handleSelectQuizOption = (optionIdx) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: optionIdx })
  }

  const handleQuizNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1)
  }

  const handleQuizPrev = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading quiz questions from server...</p>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">{error || 'Quiz not found.'}</p>
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

  const question = questions[currentQuestionIndex]
  const opts = question ? [question.option1, question.option2, question.option3, question.option4] : []
  const isLast = currentQuestionIndex === questions.length - 1
  const hasAnswer = selectedAnswers[currentQuestionIndex] !== undefined
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{quiz.quiz_title}</h2>
          <p className="text-sm text-slate-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${secondsLeft < 60 ? 'border-rose-500/50 bg-rose-500/10 text-rose-200' : 'border-slate-800 bg-slate-900 text-slate-200'}`}>
          <Clock size={16} />
          <span className="font-mono font-bold">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {question && (
        <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 space-y-4">
          <p className="text-base text-slate-100 font-semibold">{question.question_text}</p>
          <div className="grid gap-3">
            {opts.map((option, idx) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelectQuizOption(idx)}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${selectedAnswers[currentQuestionIndex] === idx ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-900'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleQuizPrev} disabled={currentQuestionIndex === 0 || submitting} className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-bold text-slate-200 border border-slate-700 disabled:opacity-40">
          Previous
        </button>
        {!isLast ? (
          <button type="button" onClick={handleQuizNext} disabled={!hasAnswer || submitting} className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-40">
            Next Question
          </button>
        ) : (
          <button type="button" onClick={submitAnswers} disabled={!hasAnswer || submitting} className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-40 flex items-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Quiz
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowCancelConfirm(true)}
          className="rounded-2xl px-5 py-3 text-sm text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {showProctor && <FaceProctor onViolation={handleViolation} onClose={() => setShowProctor(false)} />}

      <ConfirmationModal
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="Abandon Quiz?"
        message="Are you sure you want to abandon this quiz attempt? Your active choices will not be recorded."
        confirmText="Abandon Attempt"
        onConfirm={() => navigate(STUDENT_ROUTES.quizzes)}
        type="danger"
      />
    </div>
  )
}
