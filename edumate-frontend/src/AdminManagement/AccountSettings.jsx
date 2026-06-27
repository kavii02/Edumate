import React, { useEffect, useState } from 'react'
import '../index.css'
import { User, Lock, Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000'

export default function AccountSettings() {
  const adminEmail = localStorage.getItem('edumate_email') || ''

  const [profile, setProfile] = useState({ full_name: '', email: '' })
  const [loadingProfile, setLoadingProfile] = useState(true)

  /* Profile form */
  const [editName, setEditName]       = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg]   = useState(null) // {type:'success'|'error', text}

  /* Password form */
  const [currentPw, setCurrentPw]     = useState('')
  const [newPw, setNewPw]             = useState('')
  const [confirmPw, setConfirmPw]     = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [savingPw, setSavingPw]       = useState(false)
  const [pwMsg, setPwMsg]             = useState(null)

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    if (!adminEmail) { setLoadingProfile(false); return }
    try {
      setLoadingProfile(true)
      const res  = await fetch(`${API_BASE_URL}/api/admin/profile?email=${encodeURIComponent(adminEmail)}`)
      const data = await res.json()
      if (res.ok) {
        setProfile(data)
        setEditName(data.full_name || '')
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!editName.trim()) { setProfileMsg({ type: 'error', text: 'Name cannot be empty.' }); return }
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, full_name: editName.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setProfile(prev => ({ ...prev, full_name: editName.trim() }))
        setProfileMsg({ type: 'success', text: data.message || 'Profile updated.' })
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Update failed.' })
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Server error. Please try again.' })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwMsg(null)
    if (!currentPw || !newPw || !confirmPw) {
      setPwMsg({ type: 'error', text: 'All password fields are required.' }); return
    }
    if (newPw.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return
    }
    setSavingPw(true)
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, current_password: currentPw, new_password: newPw })
      })
      const data = await res.json()
      if (res.ok) {
        setPwMsg({ type: 'success', text: data.message || 'Password changed successfully.' })
        setCurrentPw(''); setNewPw(''); setConfirmPw('')
      } else {
        setPwMsg({ type: 'error', text: data.error || 'Failed to change password.' })
      }
    } catch {
      setPwMsg({ type: 'error', text: 'Server error. Please try again.' })
    } finally {
      setSavingPw(false)
    }
  }

  const Feedback = ({ msg }) => msg ? (
    <div className={`settings-feedback ${msg.type}`}>
      {msg.type === 'success'
        ? <CheckCircle size={15} />
        : <AlertCircle size={15} />}
      <span>{msg.text}</span>
    </div>
  ) : null

  return (
    <div className="account-settings-page">
      <div className="settings-page-header">
        <h2>Account Settings</h2>
        <p>Manage your admin profile and login credentials.</p>
      </div>

      <div className="settings-grid">

        {/* Profile Section */}
        <div className="settings-card neon-card-purple">
          <div className="settings-card-title">
            <User size={18} />
            <h3>Profile Information</h3>
          </div>

          {loadingProfile ? (
            <p className="settings-loading">Loading profile…</p>
          ) : (
            <>
              <div className="settings-readonly-row">
                <span className="settings-label">Email Address</span>
                <span className="settings-value email-value">{profile.email || adminEmail}</span>
              </div>

              <form onSubmit={handleSaveProfile} className="settings-form">
                <div className="settings-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <Feedback msg={profileMsg} />

                <button type="submit" className="settings-save-btn" disabled={savingProfile}>
                  <Save size={15} />
                  {savingProfile ? 'Saving…' : 'Save Profile'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Password Section */}
        <div className="settings-card neon-card-purple">
          <div className="settings-card-title">
            <Lock size={18} />
            <h3>Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="settings-field">
              <label>Current Password</label>
              <div className="settings-pw-wrap">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="Enter current password"
                />
                <button type="button" className="pw-toggle-btn" onClick={() => setShowCurrent(v => !v)}>
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label>New Password</label>
              <div className="settings-pw-wrap">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="At least 8 characters"
                />
                <button type="button" className="pw-toggle-btn" onClick={() => setShowNew(v => !v)}>
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>

            <Feedback msg={pwMsg} />

            <button type="submit" className="settings-save-btn" disabled={savingPw}>
              <Lock size={15} />
              {savingPw ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
