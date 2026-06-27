import { useState } from 'react'

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#07101f] border border-slate-800 p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
        {sent ? (
          <>
            <p className="text-sm text-slate-300 mb-6">
              If an account exists for <strong>{email}</strong>, a reset link has been sent to your email.
            </p>
            <button type="button" onClick={onClose} className="w-full py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-sm">
              Close
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-slate-400">Enter your registered email to receive a password reset link.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@school.lk"
              className="w-full rounded-xl px-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm"
              required
            />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-sm">Send Link</button>
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
