import { useState } from 'react'

const ROLES = ['Admin', 'Tutor', 'Student']

export default function App() {
  const [role, setRole] = useState(null) // null -> show role picker
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Enter both email/username and password.')
      return
    }
    setError('')
    alert(`Logging in as ${role}: ${email}`)
  }

  const chooseRole = (r) => {
    setRole(r)
    setError('')
    setEmail('')
    setPassword('')
  }

  if (!role) {
    return (
      <div className="page-shell">
        <div className="page-background" />
        <div className="login-shell">
          <div className="login-card role-picker-card">
            <div className="login-header">
              <div className="brand-mark">E</div>
              <p className="brand-subtitle">EduMate Portal</p>
              <h1>Select your role</h1>
              <p className="brand-description">Pick the role you want to sign in as.</p>
            </div>

            <div className="role-buttons large">
              {ROLES.map((r) => (
                <button key={r} className="role-button large" onClick={() => chooseRole(r)}>
                  {r}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <small className="brand-description">You can change role later by clicking Back.</small>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-background" />
      <div className="login-shell">
        <div className="login-card neon-card">
          <div className="card-inner">
            <div className="card-brand">
              <div className="brand-mark">E</div>
              <div className="brand-texts">
                <div className="brand-name">EduMate</div>
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <button className="link-button small" onClick={() => setRole(null)}>&larr; Change role</button>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Email / Username</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">📧</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your admin email"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label className="input-label">Password</label>
                  <button type="button" className="forgot-link">Forgot Password?</button>
                </div>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field"
                  />
                  <button type="button" className="eye-button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="error-row" style={{ display: error ? 'flex' : 'none' }}>
                <span className="error-icon">⚠️</span>
                <span className="error-message">{error || 'Invalid credentials or account locked.'}</span>
              </div>

              <div className="actions">
                <button type="submit" className="login-btn">Login</button>
              </div>

              {role === 'Student' && (
                <div className="student-register-block">
                  <div className="small-note">Don't you have an account?</div>
                  <button type="button" className="login-btn register-primary" onClick={() => alert('Register (placeholder)')}>Register</button>
                </div>
              )}
            </form>

            <div className="card-footer">
              {role === 'Student' ? (
                <div className="contact">Don't have an account? <button className="link-button" onClick={() => alert('Register (placeholder)')}>Register</button></div>
              ) : (
                <div className="contact">Don't have an admin account? <button className="link-button">Contact Support.</button></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
