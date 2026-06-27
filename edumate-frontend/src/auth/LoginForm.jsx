export default function LoginForm({
  role,
  email,
  password,
  showPassword,
  error,
  submitting = false,
  onEmailChange,
  onPasswordChange,
  onToggleShowPassword,
  onSubmit,
  onBack,
  onRegister,
  onForgotPassword,
}) {
  const isTutor = role === 'Tutor'
  const emailLabel = isTutor ? 'Email' : 'Username'
  const emailPlaceholder = isTutor
    ? 'Enter tutor email'
    : `Enter ${role.toLowerCase()} username`

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-mark">E</div>
          <p className="brand-subtitle">EduMate Portal</p>
          <h1>{role} login</h1>
          <p className="brand-description">Sign in to access the EduMate dashboard.</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <button className="link-button" onClick={onBack}>&larr; Back</button>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label className="field-group">
            <span>{emailLabel}</span>
            <input
              type={isTutor ? 'email' : 'text'}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder={emailPlaceholder}
              disabled={submitting}
            />
          </label>

          <label className="field-group">
            <span>Password</span>
            <div className="password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Enter your password"
                disabled={submitting}
              />
              <button type="button" className="password-toggle" onClick={onToggleShowPassword}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {isTutor && (
            <p className="brand-description" style={{ marginTop: 0 }}>
              Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.
            </p>
          )}

          {error && <p className="error-text">{error}</p>}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="submit" className="submit-button" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login'}
            </button>
            {role === 'Student' && (
              <button
                type="button"
                className="submit-button outline"
                onClick={onRegister}
                disabled={submitting}
              >
                Register
              </button>
            )}
          </div>
        </form>

        <div className="login-footer">
          <button type="button" className="link-button" onClick={onForgotPassword}>
            Forgot Password?
          </button>
          <p>Don't have an account? <span>Contact Support</span></p>
        </div>
      </div>
    </div>
  )
}
