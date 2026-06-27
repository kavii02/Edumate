import { Award, Zap, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STUDENT_ROUTES } from '../studentRoutes'

export default function RewardsPage({ points, badges, getRankInfo }) {
  const rankInfo = getRankInfo()
  const unlocked = badges.filter((b) => b.unlocked)
  const locked = badges.filter((b) => !b.unlocked)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Rewards & Badges</h2>
        <p className="text-sm text-slate-400">Track points, unlock badges, and level up your learning rank.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-950/40 to-slate-950 border border-yellow-500/20 text-center">
          <Zap size={28} className="text-yellow-400 mx-auto mb-2" />
          <p className="text-4xl font-black text-white">{points}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Points Earned</p>
        </div>
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 text-center">
          <Star size={28} className="text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-white">{rankInfo.currentEmoji} {rankInfo.current}</p>
          <p className="text-xs text-slate-400 mt-1">Current Level</p>
        </div>
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 text-center">
          <Award size={28} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-4xl font-black text-white">{unlocked.length}/{badges.length}</p>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Badges Unlocked</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award size={20} className="text-yellow-400" /> Unlocked Badges
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {unlocked.map((badge) => (
            <div key={badge.id} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-3xl">{badge.icon}</span>
              <p className="font-semibold text-white mt-2">{badge.name}</p>
              <p className="text-xs text-slate-400">{badge.desc}</p>
            </div>
          ))}
          {unlocked.length === 0 && <p className="text-sm text-slate-500">Complete quizzes to earn your first badge!</p>}
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">Locked Badges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locked.map((badge) => (
            <div key={badge.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 opacity-60">
              <span className="text-3xl grayscale">{badge.icon}</span>
              <p className="font-semibold text-slate-300 mt-2">{badge.name}</p>
              <p className="text-xs text-slate-500">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Link to={STUDENT_ROUTES.leaderboard} className="inline-block px-5 py-3 rounded-2xl bg-cyan-500 text-slate-950 text-sm font-bold hover:bg-cyan-400">
        View Leaderboard
      </Link>
    </div>
  )
}
