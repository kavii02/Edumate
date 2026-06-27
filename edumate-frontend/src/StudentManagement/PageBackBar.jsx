import { ArrowLeft } from 'lucide-react'
import './Student.css'

export default function PageBackBar({ label, onBack }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-2 group"
    >
      <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
      <span>Back to {label}</span>
    </button>
  )
}
