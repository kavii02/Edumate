import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './AdminManagement/AdminDashboard'
import StudentDashboard from './StudentManagement/StudentDashboard'
import TutorMain from './TutorManagement/TutorMain'
// Import your new skill barter system entry shell container
import SkillBarterContainer from './SkillBarterSystem/SkillBarterContainer'

const ROLES = ['Admin', 'Tutor', 'Student']

export default function App() {
  const [role, setRole] = useState(null) // null -> show role picker
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  // Temporary layout state toggle switch for local feature sandbox testing 
  const [testBarter, setTestBarter] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Enter both username and password.')
      return
    }

    const sanitizedEmail = email.trim().toLowerCase()

    // Authentication Router Check Matrix
    if (role === 'Admin' && sanitizedEmail === 'admin' && password === 'admin') {
      setError('')
      setLoggedIn(true)
      return
    }
    
    if (role === 'Student' && sanitizedEmail === 'student' && password === 'student') {
      setError('')
      setLoggedIn(true)
      return
    }

    if (role === 'Tutor' && sanitizedEmail === 'tutor' && password === 'tutor') {
      setError('')
      setLoggedIn(true)
      window.history.replaceState({}, '', '/tutor')
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

  const handleLogout = () => {
    setLoggedIn(false)
    setRole(null)
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setError('')
    if (window.location.pathname.startsWith('/tutor')) {
      window.history.replaceState({}, '', '/')
    }
  }

  if (loggedIn && role === 'Tutor') {
    return (
      <Router>
        <Routes>
          <Route path="/tutor/*" element={<TutorMain />} />
          <Route path="*" element={<Navigate to="/tutor" replace />} />
        </Routes>
      </Router>
    )
  }

  // View Router Wrapper Factory
  return (
    <div className="page-shell">
      <div className="page-background" />
      
      {/* Temporary Test Navigation Floating Badge Panel */}
      <div style={{
        position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
        background: '#0f172a', border: '1px solid #8b5cf6', padding: '10px', borderRadius: '12px',
        boxShadow: '0px 4px 20px rgba(139, 92, 246, 0.25)'
      }}>
        <button 
          onClick={() => setTestBarter(!testBarter)}
          style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {testBarter ? "← Back to Portal" : "⚡ Test Skill Barter System"}
        </button>
      </div>

      {/* Conditional Sandbox Render Filter Switch */}
      {testBarter ? (
        <div style={{ padding: '20px', position: 'relative', zIndex: 10 }}>
          <SkillBarterContainer />
        </div>
      ) : (
        /* Standard Application Authentication Router State Output */
        <>
          {/* Layer 1: Selection Gateway Dashboard Node */}
          {!role && (
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
          )}

          {/* Layer 2: Secure Application Dashboards */}
          {loggedIn && role === 'Admin' && <AdminDashboard onLogout={handleLogout} />}
          {loggedIn && role === 'Student' && <StudentDashboard onLogout={handleLogout} />}

          {/* Layer 3: Interactive Login Input Credential Deck Form Frame */}
          {role && !loggedIn && (
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
                      placeholder={`Enter ${role.toLowerCase()} username`}
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
          )}
        </>
      )}
    </div>
  )
}