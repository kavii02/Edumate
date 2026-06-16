import React from 'react'
import { Trophy, Medal } from 'lucide-react'
import './Student.css'

export default function Leaderboard({ leaderboardEntries, studentProfile, currentRankInfo }) {
  const rankMedal = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy size={20} className="text-yellow-400" />
          <h3 className="text-lg font-bold text-white">Leaderboard Rankings</h3>
        </div>
        <span className="text-xs text-slate-500 uppercase tracking-widest">A/L ICT Cohort</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-slate-500 border-b border-slate-800">
              <th className="pb-3 pr-4">Rank</th>
              <th className="pb-3 pr-4">Student</th>
              <th className="pb-3 pr-4 hidden sm:table-cell">Index No</th>
              <th className="pb-3 pr-4">Level</th>
              <th className="pb-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardEntries.map((entry) => {
              const isCurrentUser = entry.indexNo === studentProfile.indexNo
              return (
                <tr
                  key={entry.indexNo}
                  className={`border-b border-slate-850/50 ${isCurrentUser ? 'bg-cyan-500/10' : 'hover:bg-slate-900/50'}`}
                >
                  <td className="py-4 pr-4">
                    <span className={`font-bold ${entry.rank <= 3 ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {rankMedal(entry.rank)}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{entry.emoji}</span>
                      <div>
                        <p className={`font-semibold ${isCurrentUser ? 'text-cyan-300' : 'text-white'}`}>
                          {entry.name}{isCurrentUser ? ' (You)' : ''}
                        </p>
                        {entry.badges > 0 && (
                          <p className="text-[10px] text-slate-500">{entry.badges} badges earned</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 hidden sm:table-cell text-slate-400">{entry.indexNo}</td>
                  <td className="py-4 pr-4">
                    <span className="text-xs font-semibold text-purple-300">{entry.rankTitle}</span>
                  </td>
                  <td className="py-4 text-right font-bold text-cyan-400">{entry.points.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 p-4 rounded-2xl bg-slate-900/80 border border-slate-850 flex items-center gap-4">
        <Medal size={24} className="text-cyan-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-white">Your standing: {currentRankInfo.currentEmoji} {currentRankInfo.current}</p>
          <p className="text-xs text-slate-400">
            {leaderboardEntries.find((e) => e.indexNo === studentProfile.indexNo)
              ? `Rank #${leaderboardEntries.find((e) => e.indexNo === studentProfile.indexNo).rank} in your cohort`
              : 'Keep earning points to climb the leaderboard'}
          </p>
        </div>
      </div>
    </div>
  )
}
