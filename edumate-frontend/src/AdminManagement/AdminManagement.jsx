import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import '../index.css'
import { adminFetch, API_BASE_URL } from './adminApi'

export default function AdminManagement() {
  const [admins, setAdmins] = useState([])
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [message, setMessage] = useState('')

  const loadAdmins = async () => {
    const response = await adminFetch(`${API_BASE_URL}/api/admin/admins`)
    const data = await response.json()
    if (response.ok) setAdmins(data.admins || [])
  }

  useEffect(() => { loadAdmins() }, [])

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    const response = await adminFetch(`${API_BASE_URL}/api/admin/admins`, {
      method: 'POST',
      body: JSON.stringify(form)
    })
    const data = await response.json()
    if (!response.ok) {
      setMessage(data.message || 'Unable to create Admin')
      return
    }
    setForm({ full_name: '', email: '', password: '' })
    setMessage('Limited Admin created successfully.')
    loadAdmins()
  }

  const remove = async (admin) => {
    if (!window.confirm(`Delete ${admin.full_name}?`)) return
    const response = await adminFetch(`${API_BASE_URL}/api/admin/admins/${admin.admin_id}`, { method: 'DELETE' })
    if (response.ok) setAdmins((current) => current.filter((item) => item.admin_id !== admin.admin_id))
  }

  const changeLevel = async (admin, level) => {
    const response = await adminFetch(`${API_BASE_URL}/api/admin/admins/${admin.admin_id}/level`, {
      method: 'PUT',
      body: JSON.stringify({ admin_level: Number(level) })
    })
    if (response.ok) loadAdmins()
  }

  return (
    <section className="user-management-page">
      <div className="user-management-header">
        <div><h1 className="page-title">Admin Management</h1><p className="profile-page-note">Create and manage Admin accounts.</p></div>
      </div>
      {message && <p className="profile-page-note">{message}</p>}
      <div className="settings-card neon-card-purple" style={{ marginBottom: '1.5rem' }}>
        <h3>Add Limited Admin</h3>
        <form onSubmit={submit} className="settings-form">
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full name" required />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" required />
          <input type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (minimum 8 characters)" required />
          <button type="submit" className="course-action-button">Create Limited Admin</button>
        </form>
      </div>
      <div className="user-table-card neon-blink"><div className="table-wrapper"><table className="user-table">
        <thead><tr><th>NAME</th><th>EMAIL</th><th>LEVEL</th><th>ACTIONS</th></tr></thead>
        <tbody>{admins.map((admin) => <tr key={admin.admin_id}><td>{admin.full_name}</td><td>{admin.email}</td><td><select value={admin.admin_level} onChange={(event) => changeLevel(admin, event.target.value)} disabled={admin.admin_level === 1}><option value="1">Super Admin</option><option value="2">Limited Admin</option></select></td><td>{admin.admin_level !== 1 && <button type="button" className="action-button delete-button" onClick={() => remove(admin)}><Trash2 size={14} /> Delete</button>}</td></tr>)}</tbody>
      </table></div></div>
    </section>
  )
}
