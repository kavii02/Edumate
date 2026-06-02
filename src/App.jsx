import { useState } from 'react'
import AdminDashboard from './AdminManagement/AdminDashboard'
import StudentDashboard from './StudentManagement/StudentDashboard'
import TutorDashboard from './TutorManagement/TutorDashboard'

const ROLES = ['Admin', 'Tutor', 'Student']

export default function App() {
  const [role, setRole] = useState(null) // null -> show role picker
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Enter both username and password.')
      return
    }

    if (role === 'Admin' && email.trim() === 'admin' && password === 'admin') {
      setError('')
      setLoggedIn(true)
      return
    }

    setError('Invalid credentials for the selected role.')
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

  if (loggedIn && role === 'Admin') {
    return (
      <AdminDashboard
        onLogout={() => {
          setLoggedIn(false)
          setRole(null)
          setEmail('')
          setPassword('')
          setShowPassword(false)
          setError('')
        }}
      />
    )
  }

  if (loggedIn && role === 'Student') {
    return (
      <StudentDashboard
        onLogout={() => {
          setLoggedIn(false)
          setRole(null)
          setEmail('')
          setPassword('')
          setShowPassword(false)
          setError('')
        }}
      />
    )
  }

  if (loggedIn && role === 'Tutor') {
    return (
      <TutorDashboard
        onLogout={() => {
          setLoggedIn(false)
          setRole(null)
          setEmail('')
          setPassword('')
          setShowPassword(false)
          setError('')
        }}
      />
    )
  }

  return (
    <div className="page-shell">
      <div className="page-background" />
      <div className="login-shell">
        <div className="login-card">
          <div className="login-header">
            <div className="brand-mark">E</div>
            <p className="brand-subtitle">EduMate Portal</p>
            <h1>{role} login</h1>
            <p className="brand-description">Sign in to access the EduMate dashboard.</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <button className="link-button" onClick={() => setRole(null)}>&larr; Back</button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field-group">
              <span>Username</span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter username"
              />
            </label>

            <label className="field-group">
              <span>Password</span>
              <div className="password-row">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {error && <p className="error-text">{error}</p>}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button type="submit" className="submit-button">Login</button>
              {role === 'Student' && (
                <button type="button" className="submit-button outline" onClick={() => alert('Register flow (placeholder)')}>
                  Register
                </button>
              )}
            </div>
          </form>

          <div className="login-footer">
            <button type="button" className="link-button">Forgot Password?</button>
            <p>Don't have an account? <span>Contact Support</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

