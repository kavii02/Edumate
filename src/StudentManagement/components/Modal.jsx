import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, subtitle, children, size = 'md' }) {
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

  const sizeClass = size === 'lg' ? 'modal-panel-lg' : size === 'xl' ? 'modal-panel-xl' : 'modal-panel-md'

  return createPortal(
    <div className="student-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className={`student-modal-panel ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="student-modal-header">
            <div>
              {subtitle && <p className="student-modal-subtitle">{subtitle}</p>}
              {title && <h3 className="student-modal-title">{title}</h3>}
            </div>
            {onClose && (
              <button type="button" className="student-modal-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="student-modal-body">{children}</div>
      </div>
    </div>,
    document.body
  )
}
