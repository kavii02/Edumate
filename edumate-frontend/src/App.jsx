import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './AdminManagement/AdminDashboard'
import StudentDashboard from './StudentManagement/StudentDashboard'
import TutorMain from './TutorManagement/TutorMain'
import SkillBarterContainer from './SkillBarterSystem/SkillBarterContainer'
import StudentRegistration from './StudentRegistration'
import ForgotPasswordModal from './auth/ForgotPasswordModal'
import RoleSelection from './auth/RoleSelection'
import LoginForm from './auth/LoginForm'
import {
  login,
  getTutorSession,
  saveTutorSession,
  clearTutorSession,
} from './services/authApiService'

export default function App() {
  const [role, setRole] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showRegistration, setShowRegistration] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [testBarter, setTestBarter] = useState(false)

  useEffect(() => {
    const session = getTutorSession()
    if (session?.tutor_id) {
      setRole('Tutor')
      setLoggedIn(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Enter both username and password.')
      return
    }

    const sanitizedEmail = email.trim().toLowerCase()

    if (role === 'Admin' && sanitizedEmail === 'admin' && password === 'admin') {
      setError('')
      setLoggedIn(true)
      return
    }

    if (role === 'Student') {
      if (sanitizedEmail === 'student' && password === 'student') {
        setError('')
        setLoggedIn(true)
        return
      }

      setError('Invalid student credentials.')
      return
    }

    if (role === 'Tutor') {
      setSubmitting(true)
      setError('')

      const response = await login({
        role: 'tutor',
        email: sanitizedEmail,
        password,
      })

      if (response.success && response.tutor) {
        saveTutorSession(response.tutor)
        setLoggedIn(true)
        window.history.replaceState({}, '', '/tutor')
      } else {
        setError(response.message || 'Invalid email or password.')
      }

      setSubmitting(false)
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
    clearTutorSession()
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
          <Route path="/tutor/*" element={<TutorMain onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/tutor" replace />} />
        </Routes>
      </Router>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-background" />

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

      {testBarter ? (
        <div style={{ padding: '20px', position: 'relative', zIndex: 10 }}>
          <SkillBarterContainer />
        </div>
      ) : (
        <>
          {!role && <RoleSelection onChooseRole={chooseRole} />}

          {loggedIn && role === 'Admin' && <AdminDashboard onLogout={handleLogout} />}
          {loggedIn && role === 'Student' && (
            <Router>
              <StudentDashboard onLogout={handleLogout} />
            </Router>
          )}
          {showRegistration && (
            <StudentRegistration
              onRegistrationSuccess={() => {
                setShowRegistration(false)
              }}
              onBackToLogin={() => {
                setShowRegistration(false)
              }}
            />
          )}
          {role && !loggedIn && !showRegistration && (
            <LoginForm
              role={role}
              email={email}
              password={password}
              showPassword={showPassword}
              error={error}
              submitting={submitting}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onToggleShowPassword={() => setShowPassword((v) => !v)}
              onSubmit={handleSubmit}
              onBack={() => setRole(null)}
              onRegister={() => setShowRegistration(true)}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          )}
          {showForgotPassword && (
            <ForgotPasswordModal
              onClose={() => setShowForgotPassword(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
