import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import QuickAccessGrid from './QuickAccessGrid'
import { STUDENT_ROUTES } from './studentRoutes'
import './Student.css'

export default function StudentOverview({
  studentProfile,
  enrolledCoursesCount,
  completedQuizzesCount,
  currentQuizAverage,
  upcomingQuizzes = [],
  plannerTasks = [],
  courses,
  points,
  badges,
  rankInfo,
  peerTradingOffers,
  navigate,
  openSubPage,
  openCommunity,
  setSelectedClassroomCourse,
  getAISuggestions,
  handleAddRecommendationToPlanner,
  handleAcceptPeerTrade,
  handleDeclinePeerTrade,
  attendancePercentage,
  leaderboardRank
}) {
  const unlockedBadges = badges.filter((b) => b.unlocked).length
  const upcomingTasks = plannerTasks.filter((t) => !t.completed).slice(0, 4)
  const [showRankMap, setShowRankMap] = useState(false)

  const rankProgression = [
    {
      rank: 'Code Cadet',
      emoji: '👨‍🚀',
      minPoints: 0,
      maxPoints: 800,
      subBadges: [
        { icon: '🐍', name: 'Code Pioneer', desc: 'Attempted first python assessment', unlocked: true }
      ]
    },
    {
      rank: 'Rising Coder',
      emoji: '📈',
      minPoints: 800,
      maxPoints: 1100,
      subBadges: [
        { icon: '💾', name: 'Database Explorer', desc: 'Achieved 80%+ score on SQL Quiz', unlocked: true }
      ]
    },
    {
      rank: 'Code Champion',
      emoji: '🏆',
      minPoints: 1100,
      maxPoints: 1500,
      subBadges: [
        { icon: '🌐', name: 'Network Master', desc: 'Finish network model quiz flawlessly', unlocked: false },
        { icon: '🔄', name: 'Logic Master', desc: 'Score 90%+ on control structures quiz', unlocked: false }
      ]
    },
    {
      rank: 'Code Titan',
      emoji: '⚡',
      minPoints: 1500,
      maxPoints: 2000,
      subBadges: [
        { icon: '📊', name: 'SQL Wizard', desc: 'Achieve 95%+ on normalization assessment', unlocked: false },
        { icon: '🔐', name: 'Security Guardian', desc: 'Complete network security module', unlocked: false }
      ]
    },
    {
      rank: 'Legendary Scholar',
      emoji: '🌟',
      minPoints: 2000,
      maxPoints: Infinity,
      subBadges: [
        { icon: '🏗️', name: 'Systems Architect', desc: 'Master SDLC and UML diagrams', unlocked: false }
      ]
    }
  ]

  return (
    <>
      <div className="p-6 md:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-purple-900/30 via-indigo-900/10 to-cyan-950/30 border border-purple-500/10 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 blur-[50px] -z-10 rounded-full" />
        <span className="text-xs font-bold tracking-wider uppercase text-cyan-400 mb-1 block">A/L ICT Workspace</span>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Welcome back, {studentProfile.name.split(' ')[0]}!</h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed">
          Your current progress indicators and AI recommendations are up to date. Tutors have published resources for computer networking logic.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850 hover:border-purple-500/30 transition-all flex items-center justify-between cursor-pointer" onClick={() => navigate(STUDENT_ROUTES.courses)} role="button" tabIndex={0}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Courses Enrolled</span>
            <span className="text-2xl font-black text-white block">{enrolledCoursesCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 text-lg">📚</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850 hover:border-cyan-500/30 transition-all flex items-center justify-between cursor-pointer" onClick={() => navigate(STUDENT_ROUTES.quizzes)} role="button" tabIndex={0}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed Quizzes</span>
            <span className="text-2xl font-black text-white block">{completedQuizzesCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center border border-cyan-400/20 text-lg">📝</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850 hover:border-emerald-500/30 transition-all flex items-center justify-between cursor-pointer" onClick={() => navigate(STUDENT_ROUTES.attendance)} role="button" tabIndex={0}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Attendance</span>
            <span className="text-2xl font-black text-white block">{attendancePercentage}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 text-lg">📅</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850 hover:border-yellow-500/30 transition-all flex items-center justify-between cursor-pointer" onClick={() => navigate(STUDENT_ROUTES.rewards)} role="button" tabIndex={0}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Points Earned</span>
            <span className="text-2xl font-black text-white block">{points}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/20 text-lg">⚡</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850 hover:border-amber-500/30 transition-all flex items-center justify-between cursor-pointer col-span-2 sm:col-span-1" onClick={() => navigate(STUDENT_ROUTES.rewards)} role="button" tabIndex={0}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Badges</span>
            <span className="text-2xl font-black text-white block">{unlockedBadges}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 text-lg">🏅</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Upcoming Quizzes</h3>
            <button type="button" onClick={() => navigate(STUDENT_ROUTES.quizzes)} className="text-xs text-cyan-400 hover:underline">View all</button>
          </div>
          {upcomingQuizzes.length > 0 ? (
            <div className="space-y-2">
              {upcomingQuizzes.map((q) => (
                <div key={q.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-sm">
                  <span className="text-slate-200 line-clamp-1">{q.title}</span>
                  <span className="text-xs text-slate-500 shrink-0 ml-2">Due {q.dueDate}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">All quizzes completed — great work!</p>
          )}
        </div>
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Study Planner Tasks</h3>
            <button type="button" onClick={() => navigate(STUDENT_ROUTES.studyPlanner)} className="text-xs text-cyan-400 hover:underline">Open planner</button>
          </div>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-2">
              {upcomingTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-sm text-slate-300">
                  {t.text} <span className="text-xs text-slate-500">• {t.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No pending tasks. Add goals in the study planner.</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-bold text-lg text-white">Your Registered Classrooms</h3>
            <button type="button" onClick={() => navigate(STUDENT_ROUTES.courses)} className="text-xs text-cyan-400 hover:underline">
              Browse all courses
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.filter((c) => c.enrolled).map((course) => (
              <div key={course.id} className="p-5 rounded-2xl bg-slate-900/30 border border-slate-850 flex flex-col justify-between h-52 group hover:border-purple-500/20 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-950 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider">{course.id}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">{course.tutor}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors mb-2">{course.title}</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-slate-500">Modules Cleared</span>
                      <span className="text-slate-300 font-bold">{course.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-800 hover:border-purple-500/30 text-xs font-bold rounded-xl transition-all"
                    onClick={() => {
                      setSelectedClassroomCourse(course.id)
                      navigate(STUDENT_ROUTES.course(course.id))
                    }}
                  >
                    Enter Classroom & Download
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Quick Access</h3>
              <p className="text-sm text-slate-400">Jump to tools without cluttering your sidebar.</p>
            </div>
            <QuickAccessGrid
              items={[
                { label: 'Study Planner', icon: '📅', desc: 'Plan your week', onClick: () => openSubPage('planner', 'dashboard') },
                { label: 'Peer Learning', icon: '👥', desc: 'Find study partners', onClick: () => openCommunity('peers') },
                { label: 'Skill Barter', icon: '🔄', desc: 'Trade knowledge', onClick: () => openCommunity('barter') },
                { label: 'AI Feedback', icon: '🤖', desc: 'Personalized tips', onClick: () => navigate(STUDENT_ROUTES.aiFeedback) },
                { label: 'My Courses', icon: '📚', desc: 'Browse classrooms', onClick: () => navigate(STUDENT_ROUTES.courses) }
              ]}
            />
          </div>
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold">Collaborative Peer Trading</h3>
              <span className="text-[11px] text-slate-500 uppercase tracking-[0.2em]">Trade Hub</span>
            </div>
            <div className="space-y-3">
              {peerTradingOffers.map((offer) => (
                <div key={offer.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-850">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{offer.title}</p>
                      <p className="text-xs text-slate-400">With {offer.partner}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Reward: {offer.reward}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                      offer.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' :
                      offer.status === 'declined' ? 'bg-red-500/15 text-red-300 border border-red-500/20' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {offer.status === 'accepted' ? 'Accepted' : offer.status === 'declined' ? 'Declined' : 'Pending'}
                    </span>
                  </div>
                  {offer.status === 'pending' && (
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleAcceptPeerTrade(offer.id)}
                        className="flex-1 py-2 rounded-2xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclinePeerTrade(offer.id)}
                        className="flex-1 py-2 rounded-2xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors border border-slate-700"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => openCommunity('peers')}
              className="mt-5 w-full py-3 rounded-2xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors"
            >
              Open Community Hub
            </button>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900">
            <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-3">AI Recommended Feed</h3>
            {getAISuggestions().length === 0 ? (
              <p className="text-sm text-slate-500">No suggestions at this time.</p>
            ) : (
              getAISuggestions().map((s) => (
                <div key={s.topic} className="mb-3 p-3 rounded-xl bg-slate-900/80 border border-slate-850">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{s.topic}</p>
                      <p className="text-xs text-slate-400">{s.recommendation}</p>
                    </div>
                    <button onClick={() => handleAddRecommendationToPlanner(s)} className="px-3 py-2 rounded-2xl bg-cyan-500 text-slate-950 text-xs font-bold">Add to Planner</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold">Gamification Ranks</h3>
              <button type="button" onClick={() => navigate(STUDENT_ROUTES.performance)} className="text-[11px] text-cyan-400 uppercase tracking-[0.2em] hover:underline">
                Rank #{leaderboardRank} • View All
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-850">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-2">Total Points</p>
                <p className="text-3xl font-black text-white">{points}</p>
                <p className="text-xs text-slate-400 mt-1">Earned from quizzes, tasks, and peer collaboration.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-850">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Current Rank</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl">{rankInfo.currentEmoji}</span>
                      <p className="text-xl font-bold text-white">{rankInfo.current}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-[11px] rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Next: {rankInfo.nextEmoji} {rankInfo.next}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500"
                    style={{ width: `${Math.min(100, Math.round((points / rankInfo.nextPoints) * 100))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">{Math.max(rankInfo.nextPoints - points, 0)} points to unlock {rankInfo.next}.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRankMap(true)}
                className="w-full py-2 rounded-2xl bg-gradient-to-r from-purple-600/50 to-indigo-600/50 hover:from-purple-600/70 hover:to-indigo-600/70 text-white text-xs font-bold border border-purple-500/30 transition-colors flex items-center justify-center gap-2"
              >
                View Rank Progression <ChevronRight size={14} />
              </button>
            </div>
          </div>

          
        </div>
      </div>

      {showRankMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 overflow-hidden">
          <div className="w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Rank Progression Map</h2>
              <button
                type="button"
                onClick={() => setShowRankMap(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-6">Track your journey through the gamification ranks and see how to achieve the next tier.</p>

            <div className="space-y-4">
              {rankProgression.map((rk, idx) => {
                const isCurrentOrPassed = points >= rk.minPoints
                const isCurrent = points >= rk.minPoints && points < rk.maxPoints
                const isAchieved = points >= rk.maxPoints

                return (
                  <div key={rk.rank} className="relative">
                    <div className={`p-4 rounded-2xl border transition-all ${
                      isCurrent ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-purple-500/50 ring-2 ring-purple-500/30' :
                      isAchieved ? 'bg-emerald-900/20 border-emerald-500/30' :
                      'bg-slate-900/50 border-slate-800'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-4xl">{rk.emoji}</div>
                          <div className="flex-1">
                            <h3 className={`font-bold text-lg ${
                              isCurrent ? 'text-white' :
                              isAchieved ? 'text-emerald-300' :
                              'text-slate-300'
                            }`}>
                              {rk.rank}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              {rk.minPoints === 0 ? `Starting rank • 0 - ${rk.maxPoints} points` :
                               rk.maxPoints === Infinity ? `Elite rank • ${rk.minPoints}+ points` :
                               `${rk.minPoints} - ${rk.maxPoints} points`}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              {isCurrent ? `You are here • ${Math.min(100, Math.round((points / rk.maxPoints) * 100))}% progress to next rank` :
                               isAchieved ? '✓ Achieved' :
                               `Unlock by reaching ${rk.minPoints} points`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {isCurrent && (
                            <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                              CURRENT
                            </span>
                          )}
                          {isAchieved && (
                            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                              UNLOCKED
                            </span>
                          )}
                          {!isAchieved && !isCurrent && (
                            <span className="text-xs font-bold text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                              LOCKED
                            </span>
                          )}
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400">Progress to {rankInfo.next}</span>
                            <span className="text-xs font-bold text-cyan-300">{Math.round((points / rk.maxPoints) * 100)}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                              style={{ width: `${Math.min(100, Math.round((points / rk.maxPoints) * 100))}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-2">{Math.max(rk.maxPoints - points, 0)} points needed for next rank</p>
                        </div>
                      )}

                      {rk.subBadges && rk.subBadges.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">Achievements</h4>
                          <div className="space-y-2">
                            {rk.subBadges.map((badge, idx) => (
                              <div key={idx} className={`p-2 rounded-lg flex items-start gap-2 border ${badge.unlocked ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700'}`}>
                                <span className="text-lg mt-0.5">{badge.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-white">{badge.name}</p>
                                  <p className="text-[10px] text-slate-400">{badge.desc}</p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase whitespace-nowrap ml-2 ${badge.unlocked ? 'text-emerald-300' : 'text-slate-500'}`}>
                                  {badge.unlocked ? '✓' : '🔒'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {idx < rankProgression.length - 1 && (
                      <div className="flex justify-center py-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-slate-700 to-slate-800" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
              <h3 className="font-bold text-white mb-3 text-sm">How to Earn Points?</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>🎯 <strong>Quiz Completion:</strong> 50 points per correct answer</li>
                <li>📚 <strong>Course Progress:</strong> Bonus points for milestone achievements</li>
                <li>👥 <strong>Peer Collaboration:</strong> 25-100 points for trading and helping peers</li>
                <li>⭐ <strong>Badge Achievements:</strong> Extra points for unlocking special badges</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowRankMap(false)}
              className="mt-6 w-full py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:opacity-95 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
