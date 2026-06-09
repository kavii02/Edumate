import React from 'react'
import PageBackBar from './PageBackBar'
import './Student.css'

export default function QuizCenter({
  mockQuizzes,
  activeQuizState,
  activeQuizObj,
  currentQuizQuestionIndex,
  quizSelectedAnswers,
  adaptiveDifficulty,
  quizHistory,
  handleSelectQuizOption,
  handleStartQuiz,
  handleSubmitQuizAnswers,
  handleQuizNext,
  handleQuizPrev,
  handleBackToQuizList,
  quizScoreReport,
  onBack,
  backLabel = 'Dashboard',
  onViewProgress
}) {
  const levelStyles = {
    beginner: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    intermediate: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    expert: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  }
  const isLastQuestion = activeQuizObj && currentQuizQuestionIndex === activeQuizObj.questions.length - 1
  const isFirstQuestion = currentQuizQuestionIndex === 0
  const hasAnsweredCurrent = quizSelectedAnswers[currentQuizQuestionIndex] !== undefined

  return (
    <div className="space-y-6">
      {onBack && activeQuizState === 'list' && <PageBackBar label={backLabel} onBack={onBack} />}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Quiz Center</h2>
          <p className="text-sm text-slate-400 max-w-2xl">Take adaptive assessments, track performance history, and unlock badges as you complete course quizzes.</p>
        </div>
        {adaptiveDifficulty && activeQuizState === 'list' && (
          <div className="rounded-2xl bg-purple-500/10 border border-purple-500/30 px-4 py-2 text-sm">
            <span className="text-purple-300 font-semibold">Adaptive Mode: </span>
            <span className="text-white">{adaptiveDifficulty.label}</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl shadow-slate-950/20">
          {activeQuizState === 'list' && (
            <div className="space-y-4">
              {mockQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-5 rounded-3xl bg-slate-900/80 border border-slate-850">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                      <p className="text-sm text-slate-400">{quiz.questions.length} questions • {quiz.duration}</p>
                      <p className="text-xs text-purple-400 mt-1">Difficulty adapts based on your last score</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartQuiz(quiz)}
                      className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeQuizState === 'active' && activeQuizObj && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-900/80 border border-slate-850 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{activeQuizObj.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">Question {currentQuizQuestionIndex + 1} of {activeQuizObj.questions.length}</p>
                  </div>
                  {adaptiveDifficulty && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {adaptiveDifficulty.level}
                    </span>
                  )}
                </div>
                <div className="mt-4 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${((currentQuizQuestionIndex + 1) / activeQuizObj.questions.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="rounded-3xl bg-slate-900/80 border border-slate-850 p-6 space-y-4">
                <p className="text-base text-slate-100 font-semibold">{activeQuizObj.questions[currentQuizQuestionIndex].q}</p>
                <div className="grid gap-3">
                  {activeQuizObj.questions[currentQuizQuestionIndex].opts.map((option, idx) => (
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
                <button
                  type="button"
                  onClick={handleQuizPrev}
                  disabled={isFirstQuestion}
                  className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-bold text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
                >
                  Previous
                </button>
                {!isLastQuestion ? (
                  <button
                    type="button"
                    onClick={handleQuizNext}
                    disabled={!hasAnsweredCurrent}
                    className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitQuizAnswers}
                    disabled={!hasAnsweredCurrent}
                    className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Submit Quiz
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleBackToQuizList}
                  className="rounded-2xl px-5 py-3 text-sm font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {activeQuizState === 'result' && quizScoreReport && (
            <div className="rounded-3xl bg-slate-900/80 border border-slate-850 p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">Quiz Complete</h3>
                  <p className="text-sm text-slate-400">{quizScoreReport.quizTitle}</p>
                </div>
                <div className="rounded-2xl bg-cyan-500/10 border border-cyan-500 text-cyan-200 px-4 py-2 font-semibold">{quizScoreReport.percentage}%</div>
              </div>
              {quizScoreReport.level && (
                <span className={`inline-block text-xs font-bold uppercase px-3 py-1 rounded-full border ${levelStyles[quizScoreReport.level]}`}>
                  {quizScoreReport.level} level
                </span>
              )}
              {quizScoreReport.feedback && (
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-100">
                  <p className="font-semibold mb-1">Personalized Feedback</p>
                  <p className="text-xs opacity-90">{quizScoreReport.feedback}</p>
                </div>
              )}
              {quizScoreReport.suggestedQuizzes?.length > 0 && (
                <div className="rounded-2xl bg-slate-950/80 border border-slate-850 p-4">
                  <p className="text-sm font-semibold text-white mb-2">Recommended Next Quizzes</p>
                  <ul className="space-y-2">
                    {quizScoreReport.suggestedQuizzes.map((title) => (
                      <li key={title} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="text-cyan-400">→</span> {title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-300">
                <div className="rounded-2xl bg-slate-950/80 border border-slate-850 p-4">
                  <p className="text-slate-400">Correct</p>
                  <p className="text-white font-semibold">{quizScoreReport.correctCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/80 border border-slate-850 p-4">
                  <p className="text-slate-400">Total</p>
                  <p className="text-white font-semibold">{quizScoreReport.totalCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/80 border border-slate-850 p-4">
                  <p className="text-slate-400">XP Earned</p>
                  <p className="text-white font-semibold">+{quizScoreReport.pointsAwarded}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {onViewProgress && (
                  <button
                    type="button"
                    onClick={onViewProgress}
                    className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white hover:opacity-95"
                  >
                    View My Progress
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleBackToQuizList}
                  className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400"
                >
                  Back to Quiz List
                </button>
              </div>
            </div>
          )}
        </div>
        <aside className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl shadow-slate-950/10 space-y-6">
          <div>
            <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">Quick quiz tips</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>• Review course notes before starting.</li>
              <li>• Answer all questions before submitting.</li>
              <li>• Difficulty adapts to your performance.</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-slate-900/80 border border-slate-850 p-4">
            <h4 className="text-sm text-white font-semibold mb-3">Quiz History</h4>
            {quizHistory.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {quizHistory.map((entry) => (
                  <div key={entry.id} className="text-sm border-b border-slate-800 pb-2 last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-slate-200 font-medium line-clamp-1">{entry.quizTitle}</p>
                      {entry.level && (
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border shrink-0 ${levelStyles[entry.level]}`}>
                          {entry.level}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{entry.date} • {entry.percentage}% • +{entry.pointsAwarded} XP</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No quiz results yet.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
