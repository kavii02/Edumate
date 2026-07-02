import { useState } from 'react'

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState(1) // 1: Request code, 2: Reset password, 3: Success
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const handleRequestCode = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/student/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Failed to request reset code.')
        return
      }

      setInfoMessage(data.debugToken
        ? `Email sending is not configured. Use this code to verify: ${data.debugToken}`
        : 'A password reset code has been sent to your email address.'
      )
      setPhase(2)
    } catch (err) {
      setError('Connection Error: Make sure the backend is running on http://localhost:5000')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!code.trim() || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/student/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          new_password: newPassword
        })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Failed to reset password.')
        return
      }

      setPhase(3)
    } catch (err) {
      setError('Connection Error: Make sure the backend is running on http://localhost:5000')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#07101f] border border-slate-800 p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>

        {phase === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <p className="text-sm text-slate-400">Enter your registered email address. We will send you a 6-digit verification code to reset your password.</p>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="your.email@school.lk"
                className="w-full rounded-xl px-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 disabled:opacity-50 transition-colors"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {phase === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-xs text-cyan-300 font-medium leading-relaxed">{infoMessage}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => { setCode(e.target.value); setError('') }}
                placeholder="Enter 6-digit code"
                className="w-full rounded-xl px-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm tracking-widest text-center font-bold focus:border-cyan-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                placeholder="Min 8 characters"
                className="w-full rounded-xl px-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                placeholder="Repeat new password"
                className="w-full rounded-xl px-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 disabled:opacity-50 transition-colors"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                onClick={() => { setPhase(1); setError('') }}
                className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-colors"
                disabled={loading}
              >
                Back
              </button>
            </div>
          </form>
        )}

        {phase === 3 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Password Reset Successful</h3>
              <p className="text-sm text-slate-400">Your password has been changed successfully. You can now use your new password to log in.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
