import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function StudentRegistration({ onRegistrationSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    grade: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const GRADES = ['O/L Grade 10', 'O/L Grade 11', 'A/L Grade 12', 'A/L Grade 13', 'Other']

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Full name is required.')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email address is required.')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.')
      return false
    }
    if (!formData.password) {
      setError('Password is required.')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return false
    }
    if (!formData.schoolName.trim()) {
      setError('School name is required.')
      return false
    }
    if (!formData.grade) {
      setError('Please select your grade level.')
      return false
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms & Conditions.')
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Simulate registration (in a real app, this would call a backend API)
    setSuccess('Registration successful! Redirecting to login...')
    setError('')
    
    setTimeout(() => {
      onRegistrationSuccess({
        email: formData.email,
        password: formData.password,
        name: formData.name
      })
    }, 1500)
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
            <button className="link-button" onClick={onBackToLogin}>&larr; Back to Login</button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field-group">
              <span>Full Name *</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </label>

            <label className="field-group">
              <span>Email Address *</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </label>

            <label className="field-group">
              <span>School Name *</span>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="Enter your school name"
              />
            </label>

            <label className="field-group">
              <span>Grade Level *</span>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#f8fafc',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select your grade</option>
                {GRADES.map(grade => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>Password *</span>
              <div className="password-row">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label className="field-group">
              <span>Confirm Password *</span>
              <div className="password-row">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(v => !v)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                I agree to the{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setShowTermsModal(true)}
                  style={{ padding: '0 4px', textDecoration: 'underline', color: '#06b6d4' }}
                >
                  Terms & Conditions
                </button>
              </span>
            </label>

            {error && <p className="error-text">{error}</p>}
            {success && <p style={{ color: '#10b981', fontSize: '13px', marginBottom: '12px', fontWeight: '500' }}>{success}</p>}

            <button type="submit" className="submit-button" style={{ width: '100%' }}>
              Register
            </button>
          </form>

          <div className="login-footer">
            <p>Already have an account? <button type="button" className="link-button" onClick={onBackToLogin} style={{ padding: 0 }}>Sign In</button></p>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 overflow-hidden">
          <div className="w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-[#07101f] border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Terms & Conditions</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700 hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <h3 className="font-bold text-white mb-2">1. Acceptance of Terms</h3>
                <p>By creating an account and using EduMate, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">2. Use License</h3>
                <p>Permission is granted to temporarily download one copy of the materials (information or software) on EduMate for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">3. Disclaimer</h3>
                <p>The materials on EduMate are provided on an 'as is' basis. EduMate makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">4. Limitations</h3>
                <p>In no event shall EduMate or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EduMate.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">5. Accuracy of Materials</h3>
                <p>The materials appearing on EduMate could include technical, typographical, or photographic errors. EduMate does not warrant that any of the materials on its website are accurate, complete, or current. EduMate may make changes to the materials contained on its website at any time without notice.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">6. Links</h3>
                <p>EduMate has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by EduMate of the site. Use of any such linked website is at the user's own risk.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">7. Modifications</h3>
                <p>EduMate may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">8. Governing Law</h3>
                <p>These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which EduMate is located, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="w-full mt-6 px-4 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
                >
                  I Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 overflow-hidden">
          <div className="w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-[#07101f] border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700 hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <h3 className="font-bold text-white mb-2">1. Introduction</h3>
                <p>EduMate ("we" or "us" or "our") operates the EduMate website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our website and the choices you have associated with that data.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">2. Information Collection and Use</h3>
                <p>We collect several different types of information for various purposes to provide and improve our website and services.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">3. Use of Data</h3>
                <p>EduMate uses the collected data for various purposes: to provide and maintain our website; to notify you about changes to our website; to provide customer support; and to gather analysis or valuable information to improve our website.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">4. Security of Data</h3>
                <p>The security of your data is important to us, but remember that no method of transmission over the Internet is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">5. Changes to This Privacy Policy</h3>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this page.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">6. Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at: support@edumate.lk</p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full mt-6 px-4 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
