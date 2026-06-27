import React, { useState } from 'react'
import { ArrowLeftRight, Plus, Search } from 'lucide-react'
import './Student.css'

const SKILL_OPTIONS = [
  'Python Programming',
  'SQL & Databases',
  'Network Security',
  'UML & SDLC',
  'Web Development',
  'Algorithm Design'
]

export default function SkillBarter({
  peerTradingOffers,
  mySkillPosts,
  mySkillRequests,
  handlePostSkill,
  handleRequestSkill,
  handleAcceptPeerTrade,
  handleDeclinePeerTrade,
  embedded = false
}) {
  const [postSkill, setPostSkill] = useState('')
  const [postDescription, setPostDescription] = useState('')
  const [requestSkill, setRequestSkill] = useState('')
  const [requestDescription, setRequestDescription] = useState('')
  const [activeForm, setActiveForm] = useState('post')

  const onPostSubmit = (e) => {
    e.preventDefault()
    if (!postSkill.trim()) return
    handlePostSkill(postSkill, postDescription)
    setPostSkill('')
    setPostDescription('')
  }

  const onRequestSubmit = (e) => {
    e.preventDefault()
    if (!requestSkill.trim()) return
    handleRequestSkill(requestSkill, requestDescription)
    setRequestSkill('')
    setRequestDescription('')
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <ArrowLeftRight size={22} className="text-cyan-400" />
            <h2 className="text-2xl font-black text-white">Skill Barter System</h2>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            Post skills you can teach, request skills you want to learn, and exchange knowledge with peers.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setActiveForm('post')}
              className={`flex-1 py-2 rounded-2xl text-xs font-bold ${activeForm === 'post' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}
            >
              <Plus size={14} className="inline mr-1" /> Post a Skill
            </button>
            <button
              type="button"
              onClick={() => setActiveForm('request')}
              className={`flex-1 py-2 rounded-2xl text-xs font-bold ${activeForm === 'request' ? 'bg-purple-500 text-white' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}
            >
              <Search size={14} className="inline mr-1" /> Request a Skill
            </button>
          </div>

          {activeForm === 'post' ? (
            <form onSubmit={onPostSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2 block">Skill you can teach</label>
                <select
                  value={postSkill}
                  onChange={(e) => setPostSkill(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Select a skill...</option>
                  {SKILL_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2 block">Description</label>
                <textarea
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe what you can help with..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400">
                Publish Skill Offer
              </button>
            </form>
          ) : (
            <form onSubmit={onRequestSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2 block">Skill you want to learn</label>
                <select
                  value={requestSkill}
                  onChange={(e) => setRequestSkill(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Select a skill...</option>
                  {SKILL_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2 block">What you need help with</label>
                <textarea
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  rows={3}
                  placeholder="Explain your learning goal..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 text-sm font-bold text-white hover:opacity-95">
                Submit Learning Request
              </button>
            </form>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
            <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">My Posted Skills</h3>
            {mySkillPosts.length === 0 ? (
              <p className="text-sm text-slate-500">No skills posted yet.</p>
            ) : (
              <div className="space-y-3">
                {mySkillPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-850">
                    <p className="text-sm font-semibold text-white">{post.skill}</p>
                    <p className="text-xs text-slate-400 mt-1">{post.description || 'No description'}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
            <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">My Learning Requests</h3>
            {mySkillRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No requests submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {mySkillRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-850">
                    <p className="text-sm font-semibold text-white">{req.skill}</p>
                    <p className="text-xs text-slate-400 mt-1">{req.description || 'No description'}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
        <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">Incoming Exchange Offers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {peerTradingOffers.map((offer) => (
            <div key={offer.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-850">
              <p className="text-sm font-semibold text-white">{offer.title}</p>
              <p className="text-xs text-slate-400">With {offer.partner}</p>
              <p className="text-[11px] text-slate-500 mt-1">Reward: {offer.reward}</p>
              <span className={`inline-block mt-2 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                offer.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300' :
                offer.status === 'declined' ? 'bg-rose-500/15 text-rose-300' :
                'bg-slate-800 text-slate-300'
              }`}>
                {offer.status}
              </span>
              {offer.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAcceptPeerTrade(offer.id)}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeclinePeerTrade(offer.id)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
