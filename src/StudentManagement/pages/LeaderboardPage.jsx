import Leaderboard from '../Leaderboard'

export default function LeaderboardPage({ leaderboardEntries, studentProfile, getRankInfo }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        <p className="text-sm text-slate-400">See how you rank against classmates in the A/L ICT cohort.</p>
      </div>
      <Leaderboard
        leaderboardEntries={leaderboardEntries}
        studentProfile={studentProfile}
        currentRankInfo={getRankInfo()}
      />
    </div>
  )
}
