import React from 'react'
import { ArrowLeftRight } from 'lucide-react'
import './Student.css'

export default function CommunityPage({ tab, setTab, peersContent, onSkillBarterClick }) {
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
      {tab === 'peers' ? peersContent : (
        <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <ArrowLeftRight size={28} className="text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Skill Barter</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Exchange skills with classmates — offer what you know and learn what you need. This feature is being built by your team.
          </p>
          <button
            type="button"
            onClick={onSkillBarterClick}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold hover:opacity-95 transition-opacity"
          >
            Open Skill Barter
          </button>
        </div>
      )}
    </div>
  )
}
