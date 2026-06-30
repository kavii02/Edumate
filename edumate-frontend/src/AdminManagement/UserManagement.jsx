import '../index.css'
import { useEffect, useMemo, useState } from 'react'
import { Search, Eye, Trash2 } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000'
const roleOptions = ['All Roles', 'Student', 'Tutor']

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('All Roles')
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/admin/users`)
      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to load users')
        return
      }

      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      alert('Server error. Please check backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = search.trim().toLowerCase()

      const matchesSearch =
        !q ||
        [user.name, user.email, user.role, user.status].some((value) =>
          String(value || '').toLowerCase().includes(q)
        )

      const matchesRole = filterRole === 'All Roles' || user.role === filterRole

      return matchesSearch && matchesRole
    })
  }, [users, search, filterRole])

  const deleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return

    try {
      const endpoint =
        user.role === 'Student'
          ? `${API_BASE_URL}/api/admin/users/student/${user.id}`
          : `${API_BASE_URL}/api/admin/users/tutor/${user.id}`

      const response = await fetch(endpoint, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Unable to delete user')
        return
      }

      setUsers((current) =>
        current.filter((item) => !(item.id === user.id && item.role === user.role))
      )

      setSelectedUser(null)
      alert(data.message || 'User deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Server error. Please check backend.')
    }
  }

  return (
    <section className="user-management-page">
      <div className="user-management-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="profile-page-note">
            Manage students and tutors registered in EduMate.
          </p>
        </div>
      </div>

      {selectedUser ? (
        <div className="user-profile-view">
          <div className="user-profile-view-header">
            <div>
              <p className="profile-page-subtitle">User Profile View</p>
              <h2>{selectedUser.name}</h2>
              <p className="profile-page-note">Profile of: {selectedUser.name}</p>
            </div>

            <button
              type="button"
              className="profile-back-button"
              onClick={() => setSelectedUser(null)}
            >
              Back to List
            </button>
          </div>

          <div className="profile-overview-grid">
            <div className="profile-card neon-blink">
              <h3>User Details</h3>

              <div className="profile-details">
                <div className="profile-avatar-large">
                  {selectedUser.role === 'Tutor' ? '👩‍🏫' : '🎓'}
                </div>

                <div className="profile-details-list">
                  <p><span>Name:</span> {selectedUser.name}</p>
                  <p><span>Email:</span> {selectedUser.email}</p>
                  <p><span>Role:</span> {selectedUser.role}</p>
                  <p><span>Status:</span> {selectedUser.status || 'Active'}</p>

                  {selectedUser.role === 'Student' && (
                    <>
                      <p><span>School:</span> {selectedUser.school_name || 'Not available'}</p>
                      <p><span>A/L Stream:</span> {selectedUser.al_stream || 'Not available'}</p>
                      <p><span>Grade:</span> {selectedUser.grade_level || 'Not available'}</p>
                      <p><span>Rating:</span> {selectedUser.rating || 'Not available'}</p>
                    </>
                  )}

                  {selectedUser.role === 'Tutor' && (
                    <p>
                      <span>Specialization:</span>{' '}
                      {selectedUser.specialization || 'Not available'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-card neon-blink">
              <h3>Admin Actions</h3>

              <div className="activity-summary-list">
                <div><span>User Type:</span> {selectedUser.role}</div>
                <div><span>Account Status:</span> {selectedUser.status || 'Active'}</div>
                <div><span>Email:</span> {selectedUser.email}</div>
              </div>

              <button
                type="button"
                className="action-button delete-button"
                onClick={() => deleteUser(selectedUser)}
                style={{ marginTop: '1rem' }}
              >
                <Trash2 size={14} /> Delete User
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="user-management-controls">
            <div className="user-management-search">
              <Search size={18} className="control-icon" />
              <input
                type="text"
                placeholder="Search users by name, email, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="user-management-filter">
              <label>Filter by Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="user-table-card neon-blink">
            <div className="table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>STATUS</th>
                    <th className="actions-column">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="empty-state">Loading users...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">No users found.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={`${user.role}-${user.id}`}>
                        <td className="name-cell">
                          <div className="user-avatar">
                            {user.role === 'Tutor' ? '👩‍🏫' : '🎓'}
                          </div>

                          <button
                            type="button"
                            className="name-link"
                            onClick={() => setSelectedUser(user)}
                          >
                            {user.name}
                          </button>
                        </td>

                        <td>{user.email}</td>

                        <td>
                          <span className={`role-badge ${String(user.role).toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>

                        <td>
                          <span className={`status-pill ${String(user.status || 'active').toLowerCase()}`}>
                            {user.status || 'Active'}
                          </span>
                        </td>

                        <td className="actions-cell">
                          <button
                            className="action-button view-button"
                            type="button"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye size={14} /> View
                          </button>

                          <button
                            className="action-button delete-button"
                            type="button"
                            onClick={() => deleteUser(user)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}