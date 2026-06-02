import '../index.css'
import { useMemo, useState } from 'react'
import { Search, Eye, Trash2 } from 'lucide-react'

const initialUsers = [
  {
    id: 1,
    name: 'Arjuna Perera',
    email: 'arjuna.p@email.com',
    role: 'Student',
    status: 'Active',
    avatar: '👨',
    joined: 'Jan 15, 2023',
    lastLogin: 'Oct 26, 2023, 10:45 AM',
    activity: { completed: 12, inProgress: 3, requestsSent: 5, barterConfirmed: 2 },
    skillsOffered: [
      { name: 'Python Basics', proficiency: 'Proficient', duration: '2 hours/week' },
      { name: 'Data Science Intro', proficiency: 'Intermediate', duration: '3 hours/week' },
      { name: 'Web Design', proficiency: 'Proficient', duration: '2 hours/week' }
    ],
    skillsRequested: [
      { name: 'SQL Database Design', desired: 'Intermediate', proposed: '1 hour/week' },
      { name: 'Soft Skills', desired: 'Intermediate', proposed: '1 hour/week' },
      { name: 'Design Basics', desired: 'Intermediate', proposed: '1 hour/week' }
    ]
  },
  {
    id: 2,
    name: 'Dilani Silva',
    email: 'dilani.s@email.com',
    role: 'Tutor',
    status: 'Active',
    avatar: '👩',
    joined: 'Feb 18, 2023',
    lastLogin: 'May 12, 2024, 08:30 AM',
    activity: { completed: 18, inProgress: 2, requestsSent: 4, barterConfirmed: 5 },
    skillsOffered: [
      { name: 'Advanced Mathematics', proficiency: 'Proficient', duration: '3 hours/week' },
      { name: 'Physics Fundamentals', proficiency: 'Proficient', duration: '2 hours/week' },
      { name: 'Chemistry Lab', proficiency: 'Intermediate', duration: '2 hours/week' }
    ],
    skillsRequested: [
      { name: 'Presentation Skills', desired: 'Intermediate', proposed: '1 hour/week' },
      { name: 'Time Management', desired: 'Intermediate', proposed: '1 hour/week' }
    ]
  },
  {
    id: 3,
    name: 'Deman Silva',
    email: 'domai.s@email.com',
    role: 'Student',
    status: 'Inactive',
    avatar: '👨',
    joined: 'Mar 09, 2023',
    lastLogin: 'Aug 04, 2024, 02:15 PM',
    activity: { completed: 6, inProgress: 1, requestsSent: 2, barterConfirmed: 0 },
    skillsOffered: [
      { name: 'Digital Marketing', proficiency: 'Intermediate', duration: '1.5 hours/week' },
      { name: 'HTML/CSS', proficiency: 'Proficient', duration: '2 hours/week' }
    ],
    skillsRequested: [
      { name: 'Business Writing', desired: 'Intermediate', proposed: '1 hour/week' },
      { name: 'Project Planning', desired: 'Beginner', proposed: '1 hour/week' }
    ]
  },
  {
    id: 4,
    name: 'Ariana Sarahr',
    email: 'salani.s@email.com',
    role: 'Tutor',
    status: 'Blocked',
    avatar: '👩',
    joined: 'Apr 22, 2023',
    lastLogin: 'Dec 10, 2023, 11:10 AM',
    activity: { completed: 9, inProgress: 0, requestsSent: 6, barterConfirmed: 1 },
    skillsOffered: [
      { name: 'Graphic Design', proficiency: 'Proficient', duration: '2 hours/week' },
      { name: 'UI/UX Basics', proficiency: 'Intermediate', duration: '1.5 hours/week' }
    ],
    skillsRequested: [
      { name: 'Career Coaching', desired: 'Intermediate', proposed: '1 hour/week' }
    ]
  },
  {
    id: 5,
    name: 'Arjuna Perera',
    email: 'arjuna.p@email.com',
    role: 'Student',
    status: 'Blocked',
    avatar: '👨',
    joined: 'May 06, 2023',
    lastLogin: 'Jan 03, 2024, 09:20 AM',
    activity: { completed: 3, inProgress: 1, requestsSent: 4, barterConfirmed: 1 },
    skillsOffered: [
      { name: 'Business Analytics', proficiency: 'Intermediate', duration: '2 hours/week' }
    ],
    skillsRequested: [
      { name: 'Advanced SQL', desired: 'Intermediate', proposed: '1 hour/week' },
      { name: 'Leadership Skills', desired: 'Intermediate', proposed: '1 hour/week' }
    ]
  },
  {
    id: 6,
    name: 'Samela Samoih',
    email: 'namoon@email.com',
    role: 'Tutor',
    status: 'Active',
    avatar: '👩',
    joined: 'Jun 11, 2023',
    lastLogin: 'Jun 01, 2024, 09:00 AM',
    activity: { completed: 14, inProgress: 2, requestsSent: 3, barterConfirmed: 4 },
    skillsOffered: [
      { name: 'English Writing', proficiency: 'Proficient', duration: '2 hours/week' },
      { name: 'Public Speaking', proficiency: 'Proficient', duration: '1.5 hours/week' }
    ],
    skillsRequested: [
      { name: 'Career Strategy', desired: 'Intermediate', proposed: '1 hour/week' }
    ]
  },
  {
    id: 7,
    name: 'Andria Makara',
    email: 'olmti.s@email.com',
    role: 'Tutor',
    status: 'Active',
    avatar: '👩',
    joined: 'Jul 03, 2023',
    lastLogin: 'Sep 14, 2024, 04:45 PM',
    activity: { completed: 11, inProgress: 2, requestsSent: 5, barterConfirmed: 3 },
    skillsOffered: [
      { name: 'JavaScript Fundamentals', proficiency: 'Proficient', duration: '3 hours/week' },
      { name: 'React Basics', proficiency: 'Intermediate', duration: '2 hours/week' }
    ],
    skillsRequested: [
      { name: 'Performance Optimization', desired: 'Intermediate', proposed: '1 hour/week' }
    ]
  }
]

const roleOptions = ['All Roles', 'Student', 'Tutor']

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('All Roles')
  const [users, setUsers] = useState(initialUsers)
  const [selectedUser, setSelectedUser] = useState(null)

  const openUser = (user) => setSelectedUser(user)

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
          <h1>Users</h1>
        </div>
      </div>

      {selectedUser && (
        <div className="user-profile-view">
          <div className="user-profile-view-header">
            <div>
              <p className="profile-page-subtitle">User Profile View</p>
              <h2>{selectedUser.name}</h2>
              <p className="profile-page-note">Profile of: {selectedUser.name}</p>
            </div>
            <button type="button" className="profile-back-button" onClick={() => setSelectedUser(null)}>
              Back to List
            </button>
          </div>

          <div className="profile-overview-grid">
            <div className="profile-card neon-blink">
              <h3>User Details</h3>
              <div className="profile-details">
                <div className="profile-avatar-large">{selectedUser.avatar}</div>
                <div className="profile-details-list">
                  <p><span>Name:</span> {selectedUser.name}</p>
                  <p><span>Email:</span> {selectedUser.email}</p>
                  <p><span>Role:</span> {selectedUser.role}</p>
                  <p><span>Status:</span> {selectedUser.status}</p>
                  <p><span>Joining Date:</span> {selectedUser.joined}</p>
                  <p><span>Last Login:</span> {selectedUser.lastLogin}</p>
                </div>
              </div>
            </div>

            <div className="profile-card neon-blink">
              <h3>Activity Summary</h3>
              <div className="activity-summary-list">
                <div><span>Courses Completed:</span> {selectedUser.activity.completed}</div>
                <div><span>Courses In Progress:</span> {selectedUser.activity.inProgress}</div>
                <div><span>Skill Requests Sent:</span> {selectedUser.activity.requestsSent}</div>
                <div><span>Skill Barters Confirmed:</span> {selectedUser.activity.barterConfirmed}</div>
              </div>
            </div>
          </div>

          <div className="skills-grid">
            <div className="skills-card neon-blink">
              <h3>Skills Offered</h3>
              <div className="table-wrapper">
                <table className="profile-skills-table">
                  <thead>
                    <tr>
                      <th>Skill Name</th>
                      <th>Proficiency</th>
                      <th>Duration Offered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.skillsOffered.map((skill, index) => (
                      <tr key={index}>
                        <td>{skill.name}</td>
                        <td>{skill.proficiency}</td>
                        <td>{skill.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="skills-card neon-blink">
              <h3>Skills Requested</h3>
              <div className="table-wrapper">
                <table className="profile-skills-table">
                  <thead>
                    <tr>
                      <th>Skill Name</th>
                      <th>Desired Proficiency</th>
                      <th>Proposed Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.skillsRequested.map((skill, index) => (
                      <tr key={index}>
                        <td>{skill.name}</td>
                        <td>{skill.desired}</td>
                        <td>{skill.proposed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedUser && (
        <>
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
                        <button type="button" className="name-link" onClick={() => openUser(user)}>
                          {user.name}
                        </button>
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
                        <button className="action-button view-button" type="button" onClick={() => openUser(user)}>
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
        </>
      )}
    </section>
  )
}
