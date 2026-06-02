import '../index.css'
import { useMemo, useState } from 'react'
import { Search, Eye, Trash2 } from 'lucide-react'

const initialUsers = [
  { id: 1, name: 'Arjuna Perera', email: 'arjuna.p@email.com', role: 'Student', status: 'Active', avatar: '👨' },
  { id: 2, name: 'Dilani Silva', email: 'dilani.s@email.com', role: 'Tutor', status: 'Active', avatar: '👩' },
  { id: 3, name: 'Deman Silva', email: 'domai.s@email.com', role: 'Student', status: 'Inactive', avatar: '👨' },
  { id: 4, name: 'Ariana Sarahr', email: 'salani.s@email.com', role: 'Tutor', status: 'Blocked', avatar: '👩' },
  { id: 5, name: 'Arjuna Perera', email: 'arjuna.p@email.com', role: 'Student', status: 'Blocked', avatar: '👨' },
  { id: 6, name: 'Samela Samoih', email: 'namoon@email.com', role: 'Tutor', status: 'Active', avatar: '👩' },
  { id: 7, name: 'Andria Makara', email: 'olmti.s@email.com', role: 'Tutor', status: 'Active', avatar: '👩' }
]

const roleOptions = ['All Roles', 'Student', 'Tutor']

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('All Roles')
  const [users, setUsers] = useState(initialUsers)

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = [user.name, user.email].some((value) =>
        value.toLowerCase().includes(search.trim().toLowerCase())
      )
      const matchesRole = filterRole === 'All Roles' || user.role === filterRole
      return matchesSearch && matchesRole
    })
  }, [users, search, filterRole])

  const deleteUser = (id) => {
    setUsers((current) => current.filter((user) => user.id !== id))
  }

  return (
    <section className="user-management-page">
      <div className="user-management-header">
        <div>
          <h1>User Management</h1>
          <p>Admin Portal</p>
        </div>
      </div>

      <div className="user-management-controls">
        <div className="user-management-search">
          <Search size={18} className="control-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="user-management-filter">
          <label>Filter by Role</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
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
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="name-cell">
                    <div className="user-avatar">
                      {user.avatar}
                    </div>
                    <span>{user.name}</span>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-button view-button">
                      <Eye size={14} /> View
                    </button>
                    <button className="action-button delete-button" onClick={() => deleteUser(user.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
