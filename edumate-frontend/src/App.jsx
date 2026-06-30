import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import AdminDashboard from './AdminManagement/AdminDashboard'
import StudentDashboard from './StudentManagement/StudentDashboard'
import TutorMain from './TutorManagement/TutorMain'
import SkillBarterContainer from './SkillBarterSystem/SkillBarterContainer'

import StudentRegistration from './StudentRegistration'
import ForgotPasswordModal from './auth/ForgotPasswordModal'
import RoleSelection from './auth/RoleSelection'
import LoginForm from './auth/LoginForm'
import EmailVerification from './auth/EmailVerification'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('edumate_loggedIn') === 'true')
  const [role, setRole] = useState(() => localStorage.getItem('edumate_role') || null)
  const [student, setStudent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('edumate_student_obj') || 'null') } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('edumate_student_token') || null)

  const [email, setEmail] = useState(() => localStorage.getItem('edumate_email') || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationPending, setVerificationPending] = useState(false)
  const [sentVerificationCode, setSentVerificationCode] = useState('')

  const [showRegistration, setShowRegistration] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [testBarter, setTestBarter] = useState(false)
  const [timeoutMessage, setTimeoutMessage] = useState('')
  const inactivityTimerRef = useRef(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('edumate_loggedIn') === 'true'
    const storedRole = localStorage.getItem('edumate_role')

    if (storedLoggedIn && storedRole) {
      setLoggedIn(true)
      setRole(storedRole)
    }
  }, [])

  useEffect(() => {
    if (!loggedIn || role !== 'Admin') {
      return
    }

    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      inactivityTimerRef.current = window.setTimeout(() => {
        setTimeoutMessage('Session timed out due to inactivity. Please select your role again.')
        handleLogout()
      }, 5 * 60 * 1000)
    }

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll']

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer)
    })

    resetTimer()

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer)
      })
    }
  }, [loggedIn, role])

  const chooseRole = (selectedRole) => {
    setRole(selectedRole)
    setEmail('')
    setPassword('')
    setError('')
    setShowRegistration(false)
    setShowForgotPassword(false)
    setTimeoutMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Username is required.')
      return
    }

    if (!password.trim()) {
      setError('Password is required.')
      return
    }

    if (!role) {
      setError('Please select a role first.')
      return
    }

    const username = email.trim().toLowerCase()

    if (role === 'Admin') {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
            role: 'admin',
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.message || data.error || 'Invalid admin username or password.')
          return
        }

        localStorage.setItem('edumate_role', 'Admin')
        localStorage.setItem('edumate_email', username)
        localStorage.setItem('edumate_auth', JSON.stringify(data.admin || {}))

        setSentVerificationCode(data.verification_code || '')
        setVerificationPending(true)
        setError('')
        return
      } catch (err) {
        setError('Unable to connect to the authentication server.')
        return
      }
    }

    if (role === 'Student') {
      try {
        const response = await fetch(`${API_BASE_URL}/api/student/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: username, password })
        })
        const data = await response.json()
        if (!response.ok) {
          setError(data.message || 'Invalid email or password.')
          return
        }
        const studentObj = data.student
        const studentToken = data.token
        localStorage.setItem('edumate_student_id', String(studentObj.student_id))
        localStorage.setItem('edumate_student_name', `${studentObj.first_name} ${studentObj.last_name}`)
        localStorage.setItem('edumate_student_obj', JSON.stringify(studentObj))
        localStorage.setItem('edumate_student_token', studentToken)
        localStorage.setItem('edumate_role', 'Student')
        localStorage.setItem('edumate_loggedIn', 'true')
        setStudent(studentObj)
        setToken(studentToken)
        setLoggedIn(true)
        setError('')
        return
      } catch (err) {
        setError('Unable to connect to the authentication server.')
        return
      }
    }

    if (role === 'Tutor') {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/tutor-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: username, password })
        })
        const data = await response.json()
        if (!response.ok) {
          setError(data.message || 'Invalid email or password.')
          return
        }
        localStorage.setItem('edumate_tutor_id', String(data.tutor.id))
        localStorage.setItem('edumate_tutor_name', data.tutor.name)
        localStorage.setItem('edumate_role', 'Tutor')
        localStorage.setItem('edumate_loggedIn', 'true')
        localStorage.setItem('tutorSession', JSON.stringify(data.tutor))
        setLoggedIn(true)
        setError('')
        return
      } catch (err) {
        setError('Unable to connect to the authentication server.')
        return
      }
    }

    setError('Invalid role selected.')
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')

    if (!verificationCode.trim()) {
      setError('Verification code is required.')
      return
    }

    const storedEmail = localStorage.getItem('edumate_email')
    if (!storedEmail) {
      setError('Email is missing from the verification flow.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: storedEmail,
          code: verificationCode.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Invalid verification code.')
        return
      }

      localStorage.setItem('edumate_loggedIn', 'true')
      setLoggedIn(true)
      setVerificationPending(false)
      setVerificationCode('')
      setSentVerificationCode('')
      setError('')
    } catch (err) {
      setError('Unable to verify the code. Please try again.')
    }
  }

  const handleResendCode = async () => {
    setError('')
    const storedEmail = localStorage.getItem('edumate_email')
    if (!storedEmail) {
      setError('Email is missing from the verification flow.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: storedEmail }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Unable to resend verification code.')
        return
      }

      setSentVerificationCode(data.verification_code || '')
      setError('Verification code resent successfully.')
    } catch (err) {
      setError('Unable to resend the code. Please try again.')
    }
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setRole(null)
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setError('')
    setVerificationCode('')
    setVerificationPending(false)
    setShowRegistration(false)
    setShowForgotPassword(false)
    setTimeoutMessage('')

    localStorage.removeItem('edumate_role')
    localStorage.removeItem('edumate_loggedIn')
    localStorage.removeItem('edumate_email')
    localStorage.removeItem('edumate_auth')
    localStorage.removeItem('edumate_student_obj')
    localStorage.removeItem('edumate_student_token')
    localStorage.removeItem('edumate_student_id')
    localStorage.removeItem('edumate_student_name')
    setStudent(null)
    setToken(null)
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
      {timeoutMessage && (
        <div className="timeout-banner" style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          background: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #fca5a5',
          borderRadius: '10px',
          padding: '12px 18px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          maxWidth: 'min(92vw, 640px)',
          textAlign: 'center',
        }}>
          {timeoutMessage}
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#0f172a',
          border: '1px solid #8b5cf6',
          padding: '10px',
          borderRadius: '12px',
          boxShadow: '0px 4px 20px rgba(139, 92, 246, 0.25)',
        }}
      >
        <button
          onClick={() => setTestBarter(!testBarter)}
          style={{
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {testBarter ? '← Back to Portal' : '⚡ Test Skill Barter System'}
        </button>
      </div>

      {testBarter ? (
        <div style={{ padding: '20px', position: 'relative', zIndex: 10 }}>
          <SkillBarterContainer />
        </div>
      ) : (
        <>
          {!role && !loggedIn && <RoleSelection onChooseRole={chooseRole} />}

          {!verificationPending && role && !loggedIn && !showRegistration && (
            <LoginForm
              role={role}
              email={email}
              password={password}
              showPassword={showPassword}
              error={error}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onToggleShowPassword={() => setShowPassword((value) => !value)}
              onSubmit={handleSubmit}
              onBack={() => {
                setRole(null)
                setEmail('')
                setPassword('')
                setError('')
              }}
              onRegister={() => setShowRegistration(true)}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          )}

          {verificationPending && !loggedIn && (
            <EmailVerification
              email={email}
              code={verificationCode}
              error={error}
              onCodeChange={setVerificationCode}
              onSubmit={handleVerifyCode}
              onBack={() => {
                setVerificationPending(false)
                setVerificationCode('')
                setSentVerificationCode('')
                setPassword('')
                setError('')
              }}
              onResend={handleResendCode}
            />
          )}

          {showRegistration && (
            <StudentRegistration
              onRegistrationSuccess={() => setShowRegistration(false)}
              onBackToLogin={() => setShowRegistration(false)}
            />
          )}

          {loggedIn && role === 'Admin' && (
            <AdminDashboard onLogout={handleLogout} />
          )}

          {loggedIn && role === 'Student' && (
            <Router>
              <StudentDashboard onLogout={handleLogout} student={student} token={token} />
            </Router>
          )}

          {showForgotPassword && (
            <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
          )}
        </>
      )}
    </div>
  )
}