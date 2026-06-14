import React from 'react'
import './Student.css'

export default function QuickAccessGrid({ items }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className="quick-access-tile group text-left p-4 rounded-2xl bg-slate-950/60 border border-slate-850 hover:border-cyan-500/30 hover:bg-slate-900/80 transition-all"
        >
          <span className="text-2xl block mb-2">{item.icon}</span>
          <span className="text-sm font-bold text-white block group-hover:text-cyan-300 transition-colors">{item.label}</span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{item.desc}</span>
        </button>
      ))}
    </div>
  )
}
