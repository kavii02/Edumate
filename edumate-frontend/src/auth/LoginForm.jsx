export default function LoginForm({
  role,
  email,
  password,
  showPassword,
  error,
  onEmailChange,
  onPasswordChange,
  onToggleShowPassword,
  onSubmit,
  onBack,
  onRegister,
  onForgotPassword,
}) {
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
            <span>Username</span>
            <input
              type="text"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder={`Enter ${role.toLowerCase()} username`}
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
              />
              <button type="button" className="password-toggle" onClick={onToggleShowPassword}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error && <p className="error-text">{error}</p>}

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="submit" className="submit-button">Login</button>
            {role === 'Student' && (
              <button
                type="button"
                className="submit-button outline"
                onClick={onRegister}
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
