import { useState, useEffect, useRef, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import { saveTutorSession } from './services/authApiService'
import AdminDashboard from './AdminManagement/AdminDashboard'
import StudentDashboard from './StudentManagement/StudentDashboard'
import TutorMain from './TutorManagement/TutorMain'
import LandingPage from './LandingPage'

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

  // Show landing page by default when not logged in
  const [showLanding, setShowLanding] = useState(() => {
    // If already logged in or has a stored session, skip landing
    return localStorage.getItem('edumate_loggedIn') !== 'true'
  })

  const [email, setEmail] = useState(() => localStorage.getItem('edumate_email') || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationPending, setVerificationPending] = useState(false)
  const [sentVerificationCode, setSentVerificationCode] = useState('')

  const [showRegistration, setShowRegistration] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [timeoutMessage, setTimeoutMessage] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(false)
  const loginSuccessTimerRef = useRef(null)
  const inactivityTimerRef = useRef(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('edumate_loggedIn') === 'true'
    const storedRole = localStorage.getItem('edumate_role')
    const storedToken = localStorage.getItem('edumate_student_token')

    // For Student sessions: validate token against backend before restoring session.
    // This prevents stale localStorage (e.g. a previous user like Livini) from
    // auto-logging in without a real database check.
    if (storedLoggedIn && storedRole === 'Student' && storedToken) {
      fetch(`${API_BASE_URL}/api/student/verify-token`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${storedToken}` }
      })
        .then(res => {
          if (res.ok) {
            return res.json().then(data => {
              // Token valid — restore session with fresh student data from server
              if (data.student) {
                localStorage.setItem('edumate_student_obj', JSON.stringify(data.student))
                setStudent(data.student)
              }
              setLoggedIn(true)
              setRole('Student')
            })
          } else {
            // Token invalid/expired — clear all student localStorage keys
            console.warn('[Auth] Stored student token is invalid. Clearing session.')
            ;[
              'edumate_loggedIn', 'edumate_role', 'edumate_student_obj',
              'edumate_student_token', 'edumate_student_id', 'edumate_student_name',
              'edumate_fresh_login'
            ].forEach(k => localStorage.removeItem(k))
            setLoggedIn(false)
            setRole(null)
            setStudent(null)
            setToken(null)
            setShowLanding(true)
          }
        })
        .catch(() => {
          // Network error — allow cached session so app still works offline
          setLoggedIn(true)
          setRole('Student')
        })
      return
    }

    const hasAdminToken = storedRole !== 'Admin' || Boolean(localStorage.getItem('edumate_admin_token'))
    if (storedLoggedIn && storedRole && hasAdminToken) {
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
        // Flag so dashboard always redirects to /dashboard on fresh login
        localStorage.setItem('edumate_fresh_login', 'true')
        setStudent(studentObj)
        setToken(studentToken)
        setError('')
        // Show success message before entering the dashboard
        setLoginSuccess(true)
        if (loginSuccessTimerRef.current) clearTimeout(loginSuccessTimerRef.current)
        loginSuccessTimerRef.current = window.setTimeout(() => {
          setLoginSuccess(false)
          setLoggedIn(true)
        }, 1800)
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
        saveTutorSession({ tutor_id: data.tutor.id, name: data.tutor.name, email: username })
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
      if (data.token) localStorage.setItem('edumate_admin_token', data.token)
      localStorage.setItem('edumate_admin_level', String(data.admin?.admin_level || 2))
      localStorage.setItem('edumate_admin_obj', JSON.stringify(data.admin || {}))
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
    // Clear any pending login success timer
    if (loginSuccessTimerRef.current) clearTimeout(loginSuccessTimerRef.current)
    setLoginSuccess(false)
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
    setShowLanding(true)  // Go back to landing page on logout

    localStorage.removeItem('edumate_role')
    localStorage.removeItem('edumate_loggedIn')
    localStorage.removeItem('edumate_email')
    localStorage.removeItem('edumate_auth')
    localStorage.removeItem('edumate_student_obj')
    localStorage.removeItem('edumate_student_token')
    localStorage.removeItem('edumate_student_id')
    localStorage.removeItem('edumate_student_name')
    localStorage.removeItem('edumate_tutor_id')
    localStorage.removeItem('edumate_tutor_name')
    localStorage.removeItem('edumate_admin_token')
    localStorage.removeItem('edumate_admin_level')
    localStorage.removeItem('edumate_admin_obj')
    localStorage.removeItem('tutorSession')
    localStorage.removeItem('edumate_fresh_login')
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

  // Show landing page when user is not logged in and hasn't clicked Login/Get Started
  if (!loggedIn && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />
  }

  return (
    <div className="page-shell">
      <div className="page-background" />

      {/* ── Login success toast — on-brand Edumate style ── */}
      {loginSuccess && (
        <div style={{
          position: 'fixed',
          top: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          background: 'rgba(10, 15, 35, 0.96)',
          border: '1px solid rgba(139, 92, 246, 0.45)',
          borderRadius: '20px',
          padding: '0',
          boxShadow: '0 8px 48px rgba(124, 58, 237, 0.32), 0 0 0 1px rgba(56,189,248,0.10)',
          maxWidth: 'min(92vw, 440px)',
          width: '440px',
          backdropFilter: 'blur(18px)',
          overflow: 'hidden',
          animation: 'slideDownFadeIn 0.4s cubic-bezier(0.22,1,0.36,1)',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        }}>
          {/* Gradient accent bar at top */}
          <div style={{
            height: '3px',
            background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)',
          }} />

          {/* Card body */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '18px 22px 14px',
          }}>
            {/* Icon — Lucide CheckCircle path, in the system purple */}
            <div style={{
              flexShrink: 0,
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.16)',
              border: '1px solid rgba(139, 92, 246, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="url(#em-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="em-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            {/* Text */}
            <div>
              <p style={{ margin: 0, color: '#f8fafc', fontWeight: 700, fontSize: '0.97rem', letterSpacing: '-0.01em' }}>
                Login successful!
              </p>
              <p style={{ margin: '2px 0 0', color: '#c4b5fd', fontSize: '0.85rem', fontWeight: 500 }}>
                Welcome back{student ? `, ${student.first_name}` : ''}! Taking you to your dashboard…
              </p>
            </div>
          </div>

          {/* Draining progress bar — drains over 1.8 s matching the timer */}
          <div style={{ height: '3px', background: 'rgba(139,92,246,0.12)', margin: '0 22px 14px' }}>
            <div style={{
              height: '100%',
              width: '100%',
              background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)',
              borderRadius: '2px',
              animation: 'drainProgress 1.8s linear forwards',
            }} />
          </div>
        </div>
      )}

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
              onRegistrationSuccess={(studentData) => {
                // Read the session data stored by the registration component
                const storedObj = localStorage.getItem('edumate_student_obj')
                const storedToken = localStorage.getItem('edumate_student_token')
                try {
                  const parsed = storedObj ? JSON.parse(storedObj) : studentData
                  setStudent(parsed)
                } catch {
                  setStudent(studentData || null)
                }
                if (storedToken) setToken(storedToken)
                setRole('Student')
                setShowRegistration(false)
                setLoggedIn(true)
              }}
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
      </div>
    )
  }
