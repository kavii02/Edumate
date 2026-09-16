import React from 'react'
import './Student.css'
import SkillBarterContainer from '../SkillBarterSystem/SkillBarterContainer'

export default function CommunityPage({ tab, setTab, peersContent }) {
  const tabs = [
    { id: 'peers', label: 'Peer Learning' },
    { id: 'barter', label: 'Skill Barter' }
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400 max-w-2xl">
        Collaborate with classmates — find study partners or exchange ICT skills.
      </p>
      <div className="inline-flex rounded-2xl bg-slate-950/80 border border-slate-800 p-1 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'peers' ? peersContent : <SkillBarterContainer />}
    </div>
  )
}
