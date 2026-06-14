export default function RoleSelection({ onChooseRole }) {
  const ROLES = ['Admin', 'Tutor', 'Student']

  return (
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
            <button key={r} className="role-button large" onClick={() => onChooseRole(r)}>
              {r}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <small className="brand-description">You can change role later by clicking Back.</small>
        </div>
      </div>
    </div>
  )
}
