import '../index.css'
import { useState } from 'react'
import {
  LayoutGrid,
  Users,
  BookOpen,
  Edit3,
  FileText,
  Settings,
  Search,
  Bell,
  Mail,
  ChevronDown,
  TrendingUp,
  UserCheck,
  Activity,
  ChevronRight
} from 'lucide-react'
import UserManagement from './UserManagement'

const navItems = [
  { name: 'Dashboard', icon: <LayoutGrid size={18} /> },
  { name: 'User Management', icon: <Users size={18} /> },
  { name: 'Course Approval', icon: <BookOpen size={18} /> },
  { name: 'Skill Barter', icon: <Edit3 size={18} /> },
  { name: 'System Logs', icon: <FileText size={18} /> },
  { name: 'Reports', icon: <TrendingUp size={18} /> },
  { name: 'Account Settings', icon: <Settings size={18} /> }
]

const courseApprovals = [
  {
    id: 1,
    course: 'Advanced Python for Data Science',
    tutor: 'Dr. Arjuna Perera',
    submitted: 'Oct 26, 2023, 11:30 AM',
    status: 'Pending Approval'
  },
  {
    id: 2,
    course: 'SQL Database Design Fundamental',
    tutor: 'Ms. Dilani Silva',
    submitted: 'Oct 25, 2023, 09:15 AM',
    status: 'Pending Approval'
  },
  {
    id: 3,
    course: 'Full Stack Web Development (MERN)',
    tutor: 'Mr. Deman Silva',
    submitted: 'Oct 24, 2023, 04:45 PM',
    status: 'Pending Approval'
  }
]

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const pageTitle = activeTab === 'User Management' ? '' : activeTab

  return (
    <div className="admin-dashboard-shell">
      <div className="admin-dashboard-backdrop" />
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">E</div>
          <div>
            <p className="sidebar-label">EduMate</p>
            <span className="sidebar-note">Admin Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`sidebar-nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {activeTab === item.name && <ChevronRight size={16} className="nav-arrow" />}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main-panel">
        <header className="admin-main-header">
          <div>
            <p className="page-subtitle">Admin Portal</p>
            {pageTitle && <h1 className="page-title">{pageTitle}</h1>}
          </div>
          <div className="header-actions">
            <button className="icon-pill">
              <Bell size={16} />
            </button>
            <button className="icon-pill">
              <Mail size={16} />
            </button>
            <button className="profile-pill" type="button">
              <UserCheck size={16} />
              Admin
              <ChevronDown size={16} />
            </button>
            <button className="logout-pill" type="button" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </header>

        {activeTab === 'User Management' ? (
          <UserManagement />
        ) : activeTab === 'Course Approval' ? (
          <section className="course-approval-section">
            <div className="course-approval-header">
              <div>
                <p className="course-approval-subtitle">Courses Pending Review</p>
              </div>
            </div>

            <div className="course-approval-card neon-card-purple">
              <div className="table-wrapper">
                <table className="course-approval-table">
                  <thead>
                    <tr>
                      <th>COURSE NAME</th>
                      <th>TUTOR</th>
                      <th>DATE SUBMITTED</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseApprovals.map((item) => (
                      <tr key={item.id}>
                        <td>{item.course}</td>
                        <td>{item.tutor}</td>
                        <td>{item.submitted}</td>
                        <td>
                          <span className="course-status-pill">{item.status}</span>
                        </td>
                        <td className="course-actions-cell">
                          <button type="button" className="course-view-button">
                            View Details
                          </button>
                          <button type="button" className="course-action-button">
                            Approve / Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="course-approval-footer">
                <div className="course-pagination">« 1 2 3 »</div>
                <div className="course-pending-count">Total Pending: 7</div>
              </div>
            </div>
          </section>
        ) : activeTab === 'Dashboard' ? (
          <>
            <section className="dashboard-grid">
              <div className="dashboard-card neon-card-purple">
                <div className="card-icon">
                  <Users size={24} />
                </div>
                <h2>TOTAL USERS</h2>
                <p className="card-value">14,500</p>
              </div>
              <div className="dashboard-card neon-card-purple">
                <div className="card-icon">
                  <BookOpen size={24} />
                </div>
                <h2>TOTAL COURSES</h2>
                <p className="card-value">325</p>
              </div>
              <div className="dashboard-card neon-card-purple">
                <div className="card-icon">
                  <Activity size={24} />
                </div>
                <h2>PENDING SKILL REQUESTS</h2>
                <p className="card-value">72</p>
              </div>
              <div className="dashboard-card neon-card-purple">
                <div className="card-icon">
                  <UserCheck size={24} />
                </div>
                <h2>ACTIVE TUTORS</h2>
                <p className="card-value">150</p>
              </div>
            </section>

            <section className="system-alerts-section">
              <div className="alerts-card neon-card-purple">
                <h2>System Alerts (Logs)</h2>
                <div className="table-wrapper">
                  <table className="alerts-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>User</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>12:05 PM</td>
                        <td><span className="alert-level critical">CRITICAL</span></td>
                        <td>Tutor_A</td>
                        <td>DB connection failed</td>
                      </tr>
                      <tr>
                        <td>11:58 AM</td>
                        <td><span className="alert-level info">INFO</span></td>
                        <td>Admin_B</td>
                        <td>User created</td>
                      </tr>
                      <tr>
                        <td>12:05 AM</td>
                        <td><span className="alert-level critical">CRITICAL</span></td>
                        <td>Admin_A</td>
                        <td>DB connection failed</td>
                      </tr>
                      <tr>
                        <td>11:58 AM</td>
                        <td><span className="alert-level info">INFO</span></td>
                        <td>Admin_B</td>
                        <td>User created</td>
                      </tr>
                      <tr>
                        <td>11:50 AM</td>
                        <td><span className="alert-level critical">CRITICAL</span></td>
                        <td>Main_A</td>
                        <td>DB connection failed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="dashboard-placeholder">
            <div className="dashboard-placeholder-card">
              <div className="placeholder-icon">
                <Activity size={28} />
              </div>
              <h2>{activeTab}</h2>
              <p>Content for this section will be shown here once it is available.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
