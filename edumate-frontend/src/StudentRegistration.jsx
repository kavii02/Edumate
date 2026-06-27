import { useState, useRef, useEffect } from 'react'

export default function StudentRegistration({ onRegistrationSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    gradeLevel: '',
    alStream: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const CODE_LENGTH = 6
  const [verificationDigits, setVerificationDigits] = useState(Array(CODE_LENGTH).fill(''))
  const digitRefs = useRef([])

  const GRADES = ['O/L Grade 10', 'O/L Grade 11', 'A/L Grade 12', 'A/L Grade 13', 'Other']
  const AL_STREAMS = ['Arts', 'Commerce', 'Science', 'Maths', 'Technology']

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) { setError('First name is required.'); return false }
    if (!formData.lastName.trim()) { setError('Last name is required.'); return false }
    if (!formData.email.trim()) { setError('Email address is required.'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Please enter a valid email address.'); return false }
    if (!formData.password) { setError('Password is required.'); return false }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters long.'); return false }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return false }
    if (!formData.schoolName.trim()) { setError('School name is required.'); return false }
    if (!formData.gradeLevel) { setError('Please select your grade level.'); return false }
    if (!formData.alStream) { setError('Please select your AL stream.'); return false }
    if (!formData.agreeToTerms) { setError('You must agree to the Terms & Conditions.'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          schoolName: formData.schoolName,
          gradeLevel: formData.gradeLevel,
          alStream: formData.alStream
        })
      })

      const responseText = await response.text()
      let data = {}
      try { data = JSON.parse(responseText) } catch {
        setError(`Backend Error (${response.status}): ${responseText.substring(0, 300)}`)
        return
      }

      if (!response.ok) {
        setError(data.message || `Registration failed: ${response.status} ${response.statusText}`)
        return
      }

      setSuccess('Registration successful! Check your email for the verification code.')
      setVerificationEmail(formData.email)
      setVerificationMessage(data.debugToken
        ? `Email sending is not configured. Use this code to verify: ${data.debugToken}`
        : 'A verification code has been sent to your email address.'
      )
      setShowVerificationModal(true)
      setVerificationError('')
      setVerificationDigits(Array(CODE_LENGTH).fill(''))
    } catch (err) {
      setError(`Connection Error: ${err.message || 'Unable to connect to the server'}. Make sure the backend is running on http://localhost:5000`)
    }
  }

  const handleVerifyEmail = async () => {
    const code = verificationDigits.join('').trim()
    if (!code || code.length < CODE_LENGTH) { setVerificationError('Please enter the complete verification code.'); return }

    try {
      const response = await fetch('http://localhost:5000/api/student/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail, code })
      })
      const data = await response.json()
      if (!response.ok) { setVerificationError(data.message || 'Verification failed.'); return }

      setSuccess('Email verified successfully! You can now log in.')
      setVerificationError('')
      setShowVerificationModal(false)
      setTimeout(() => {
        onRegistrationSuccess?.({ email: verificationEmail, firstName: formData.firstName, lastName: formData.lastName })
      }, 600)
    } catch {
      setVerificationError('Unable to verify the email. Please check your network and try again.')
    }
  }

  const handleResendVerification = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/student/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail })
      })
      const data = await response.json()
      if (!response.ok) { setVerificationError(data.message || 'Unable to resend verification code.'); return }
      setVerificationMessage(data.debugToken
        ? `Email sending is not configured. Use this code: ${data.debugToken}`
        : 'A new verification code has been sent to your email.'
      )
      setVerificationError('')
    } catch {
      setVerificationError('Unable to resend verification code. Please try again later.')
    }
  }

  useEffect(() => {
    if (showVerificationModal) {
      const firstEmpty = verificationDigits.findIndex(d => d === '')
      const idx = firstEmpty === -1 ? CODE_LENGTH - 1 : firstEmpty
      setTimeout(() => digitRefs.current[idx]?.focus(), 0)
    }
  }, [showVerificationModal])

  const handleDigitChange = (e, index) => {
    const digit = e.target.value.replace(/[^0-9]/g, '').slice(-1)
    setVerificationDigits(prev => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    setVerificationError('')
    if (digit && index < CODE_LENGTH - 1) digitRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (verificationDigits[index]) {
        setVerificationDigits(prev => { const next = [...prev]; next[index] = ''; return next })
      } else if (index > 0) {
        digitRefs.current[index - 1]?.focus()
        setVerificationDigits(prev => { const next = [...prev]; next[index - 1] = ''; return next })
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      digitRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const paste = (e.clipboardData || window.clipboardData).getData('text')
    const digits = paste.replace(/\D/g, '').slice(0, CODE_LENGTH).split('')
    setVerificationDigits(prev => {
      const next = [...prev]
      for (let i = 0; i < CODE_LENGTH; i++) next[i] = digits[i] || ''
      return next
    })
    setTimeout(() => digitRefs.current[Math.min(digits.length, CODE_LENGTH - 1)]?.focus(), 0)
  }

  return (
    <div className="page-shell">
      <div className="page-background" />
      <div className="login-shell">
        <div className="login-card" style={{ maxWidth: '450px' }}>
          <div className="login-header">
            <div className="brand-mark">E</div>
            <p className="brand-subtitle">EduMate Portal</p>
            <h1>Create Account</h1>
            <p className="brand-description">Join thousands of students learning A/L ICT.</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <button className="link-button" type="button" onClick={onBackToLogin}>&larr; Back to Login</button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field-group">
              <span>First Name *</span>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter your first name" />
            </label>

            <label className="field-group">
              <span>Last Name *</span>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter your last name" />
            </label>

            <label className="field-group">
              <span>Email Address *</span>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
            </label>

            <label className="field-group">
              <span>School Name *</span>
              <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="Enter your school name" />
            </label>

            <label className="field-group">
              <span>Grade Level *</span>
              <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(15,23,42,0.8)', color: '#f8fafc', fontSize: '14px', cursor: 'pointer' }}>
                <option value="">Select your grade</option>
                {GRADES.map(grade => <option key={grade} value={grade}>{grade}</option>)}
              </select>
            </label>

            <label className="field-group">
              <span>AL Stream *</span>
              <select name="alStream" value={formData.alStream} onChange={handleChange} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(15,23,42,0.8)', color: '#f8fafc', fontSize: '14px', cursor: 'pointer' }}>
                <option value="">Select your AL stream</option>
                {AL_STREAMS.map(stream => <option key={stream} value={stream}>{stream}</option>)}
              </select>
            </label>

            <label className="field-group">
              <span>Password *</span>
              <div className="password-row">
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
            </label>

            <label className="field-group">
              <span>Confirm Password *</span>
              <div className="password-row">
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(v => !v)}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} style={{ cursor: 'pointer' }} />
              <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                I agree to the{' '}
                <button type="button" className="link-button" onClick={() => setShowTermsModal(true)} style={{ padding: '0 4px', textDecoration: 'underline', color: '#06b6d4' }}>
                  Terms &amp; Conditions
                </button>
              </span>
            </label>

            {error && <p className="error-text">{error}</p>}
            {success && <p style={{ color: '#10b981', fontSize: '13px', marginBottom: '12px', fontWeight: '500' }}>{success}</p>}

            <button type="submit" className="submit-button" style={{ width: '100%' }}>Register</button>
          </form>

          <div className="login-footer">
            <p>Already have an account? <button type="button" className="link-button" onClick={onBackToLogin} style={{ padding: 0 }}>Sign In</button></p>
          </div>
        </div>
      </div>

      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 overflow-hidden">
          <div className="w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-[#07101f] border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
                <p className="text-slate-300 text-sm mt-1">Enter the code sent to <strong>{verificationEmail}</strong>.</p>
              </div>
              <button onClick={() => setShowVerificationModal(false)} className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700 hover:bg-slate-700">Close</button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <label className="field-group" style={{ marginBottom: '12px' }}>
                  <span>Verification Code *</span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 8 }} onPaste={handlePaste}>
                    {verificationDigits.map((d, i) => (
                      <input
                        key={i}
                        ref={el => { digitRefs.current[i] = el }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleDigitChange(e, i)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        style={{ width: 44, height: 44, textAlign: 'center', fontSize: '18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', color: '#ffffff' }}
                        aria-label={`Digit ${i + 1}`}
                      />
                    ))}
                  </div>
                </label>
              </div>

              {verificationMessage && <p className="text-slate-200 text-sm">{verificationMessage}</p>}
              {verificationError && <p className="text-red-400 text-sm">{verificationError}</p>}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={handleVerifyEmail} className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400">Verify Email</button>
                <button type="button" onClick={handleResendVerification} className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 text-white border border-slate-700 hover:bg-slate-700">Resend Code</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 overflow-hidden">
          <div className="w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-[#07101f] border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Terms &amp; Conditions</h2>
              <button onClick={() => setShowTermsModal(false)} className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700 hover:bg-slate-700">Close</button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div><h3 className="font-bold text-white mb-2">1. Acceptance of Terms</h3><p>By creating an account and using EduMate, you accept and agree to be bound by the terms and provision of this agreement.</p></div>
              <div><h3 className="font-bold text-white mb-2">2. Use License</h3><p>Permission is granted to temporarily use the materials on EduMate for personal, non-commercial transitory viewing only.</p></div>
              <div><h3 className="font-bold text-white mb-2">3. Disclaimer</h3><p>The materials on EduMate are provided on an 'as is' basis. EduMate makes no warranties, expressed or implied.</p></div>
              <div><h3 className="font-bold text-white mb-2">4. Limitations</h3><p>EduMate shall not be liable for any damages arising out of the use or inability to use the materials on EduMate.</p></div>
              <div><h3 className="font-bold text-white mb-2">5. Governing Law</h3><p>These terms and conditions are governed by and construed in accordance with applicable law.</p></div>
              <div>
                <button type="button" onClick={() => setShowTermsModal(false)} className="w-full mt-6 px-4 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400">I Accept</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
