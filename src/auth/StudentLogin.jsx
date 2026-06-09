import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ForgotPasswordModal from './ForgotPasswordModal'

export default function StudentLogin({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showForgot, setShowForgot] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter both email/username and password.')
      return
    }
    if ((email.trim() === 'student' && password === 'student') || (email.trim() && password)) {
      onLogin({ email: email.trim(), password })
      navigate('/dashboard')
      return
    }
    setError('Invalid credentials. Try student / student for demo.')
  }

  return (
    <div className="page-shell">
      <div className="page-background" />
      <div className="login-shell">
        <div className="login-card">
          <div className="login-header">
            <div className="brand-mark">E</div>
            <p className="brand-subtitle">EduMate Portal</p>
            <h1>Student Login</h1>
            <p className="brand-description">Sign in to access your dashboard, courses, and quizzes.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field-group">
              <span>Email / Username</span>
              <input
                type="text"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="Enter email or username"
              />
            </label>

            <label className="field-group">
              <span>Password</span>
              <div className="password-row">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter your password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="submit-button" style={{ width: '100%' }}>Login</button>
          </form>

          <div className="login-footer">
            <button type="button" className="link-button" onClick={() => setShowForgot(true)}>Forgot Password?</button>
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="link-button" style={{ padding: 0 }}>Register</Link>
            </p>
          </div>
        </div>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  )
}
