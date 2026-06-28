export default function EmailVerification({ email, code, error, onCodeChange, onSubmit, onBack, onResend }) {
  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-mark">E</div>
          <p className="brand-subtitle">EduMate Portal</p>
          <h1>Email verification</h1>
          <p className="brand-description">
            Enter the verification code sent to <strong>{email}</strong> to continue.
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <button className="link-button" type="button" onClick={onBack}>&larr; Back to login</button>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label className="field-group">
            <span>Verification code</span>
            <input
              type="text"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder="Enter your verification code"
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="submit-button">Verify code</button>
        </form>

        <div className="login-footer">
          <button type="button" className="link-button" onClick={onResend}>
            Resend verification code
          </button>
          <p>If you do not receive the email, click Resend and check your inbox.</p>
        </div>
      </div>
    </div>
  )
}
