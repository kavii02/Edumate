import React from 'react'
import './Student.css'

export default function Notifications({ notifications, markRead, clearNotification, clearAll }) {
  return (
    <div className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-semibold">Notifications</p>
          <h2 className="text-2xl font-black text-white">Your notifications</h2>
        </div>
        <div className="space-x-2">
          <button onClick={clearAll} className="px-3 py-2 rounded-2xl bg-slate-800 text-slate-300 text-xs">Clear All</button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-slate-500">No notifications right now.</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`p-3 rounded-2xl border ${n.unread ? 'border-cyan-500/30 bg-slate-900/80' : 'border-slate-800 bg-slate-950/80'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{n.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{n.time || ''}</p>
                </div>
                <div className="flex gap-2">
                  {n.unread && <button onClick={() => markRead(n.id)} className="px-2 py-1 rounded-2xl bg-cyan-500 text-slate-900 text-xs">Mark read</button>}
                  <button onClick={() => clearNotification(n.id)} className="px-2 py-1 rounded-2xl bg-slate-800 text-slate-300 text-xs">Dismiss</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
