import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, LogOut, CheckCircle } from 'lucide-react'

export default function ConfirmationModal({
  open,
  onClose,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  onConfirm,
  type = 'warning'
}) {
  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={36} className="text-rose-400" />
      case 'success':
        return <CheckCircle size={36} className="text-emerald-400" />
      case 'logout':
        return <LogOut size={36} className="text-pink-400" />
      default:
        return <AlertTriangle size={36} className="text-amber-400" />
    }
  }

  const getConfirmBtnClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/30 shadow-lg shadow-rose-500/10'
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/30 shadow-lg shadow-emerald-500/10'
      case 'logout':
        return 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white border-rose-500/30 shadow-lg shadow-pink-500/15'
      default:
        return 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400/30 shadow-lg shadow-amber-500/10'
    }
  }

  return createPortal(
    <div className="student-modal-overlay" role="dialog" aria-modal="true" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="student-modal-panel modal-panel-md"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#070f1e',
          borderColor: 'rgba(56, 189, 248, 0.2)',
          padding: '2rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 shadow-inner">
            {getIcon()}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">{message}</p>
          </div>
          <div className="flex items-center justify-center gap-3 w-full pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 transition active:scale-95"
              style={{ minWidth: '110px' }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => { onConfirm(); onClose() }}
              className={`px-6 py-3 rounded-xl text-sm font-bold border transition active:scale-95 ${getConfirmBtnClass()}`}
              style={{ minWidth: '110px' }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
