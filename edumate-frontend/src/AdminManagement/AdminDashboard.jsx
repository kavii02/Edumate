import '../index.css'
import { useEffect, useState } from 'react'
import {
  LayoutGrid,
  Users,
  BookOpen,
  FileText,
  Settings,
  Bell,
  Mail,
  ChevronDown,
  UserCheck,
  Activity,
  ChevronRight
} from 'lucide-react'

import UserManagement from './UserManagement'
import CourseApproval from './CourseApproval'
import SystemMonitoring from './SystemMonitoring'
import UserReports from './UserReports'
import SystemLogs from './SystemLogs'
import AccountSettings from './AccountSettings'

const API_BASE_URL = 'http://localhost:5000'

const navItems = [
  { name: 'Dashboard', icon: <LayoutGrid size={18} /> },
  { name: 'User Management', icon: <Users size={18} /> },
  { name: 'Course Approval', icon: <BookOpen size={18} /> },
  { name: 'User Reports', icon: <Mail size={18} /> },
  { name: 'System Monitoring', icon: <Activity size={18} /> },
  { name: 'System Logs', icon: <FileText size={18} /> },
  { name: 'Account Settings', icon: <Settings size={18} /> }
]

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Dashboard')

  const [summary, setSummary] = useState({
    total_students: 0,
    total_tutors: 0,
    total_courses: 0,
    pending_skill_requests: 0,
    pending_reports: 0
  })

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const pageTitle = activeTab === 'User Management' ? '' : activeTab

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const summaryResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard-summary`)
      const summaryData = await summaryResponse.json()

      if (summaryResponse.ok) {
        setSummary(summaryData)
      }

      const logsResponse = await fetch(`${API_BASE_URL}/api/admin/system-logs`)
      const logsData = await logsResponse.json()

      if (logsResponse.ok) {
        setLogs(logsData.slice(0, 5))
      }
    } catch (error) {
      console.error('Admin dashboard loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalUsers = summary.total_students + summary.total_tutors

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
              {activeTab === item.name && (
                <ChevronRight size={16} className="nav-arrow" />
              )}
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
            <button className="icon-pill" type="button">
              <Bell size={16} />
            </button>

            <button className="icon-pill" type="button">
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
          <CourseApproval />
        ) : activeTab === 'User Reports' ? (
          <UserReports />
        ) : activeTab === 'System Monitoring' ? (
          <SystemMonitoring />
        ) : activeTab === 'System Logs' ? (
          <SystemLogs />
        ) : activeTab === 'Account Settings' ? (
          <AccountSettings />
        ) : activeTab === 'Dashboard' ? (
          <>
            <section className="dashboard-grid">
              <div className="dashboard-card neon-card-purple">
                <div className="card-icon">
                  <Users size={24} />
                </div>
                <h2>TOTAL USERS</h2>
                <p className="card-value">
                  {loading ? '...' : totalUsers}
                </p>
              </div>

              <div className="dashboard-card neon-card-purple">
                <div className="card-icon">
                  <BookOpen size={24} />
                </div>
                <h2>TOTAL COURSES</h2>
                <p className="card-value">
                  {loading ? '...' : summary.total_courses}
                </p>
              </div>

              <div className="dashboard-card neon-card-purple">
                <div className="card-icon">
                  <Activity size={24} />
                </div>
                <h2>PENDING SKILL REQUESTS</h2>
                <p className="card-value">
                  {loading ? '...' : summary.pending_skill_requests}
                </p>
              </div>

              <div className="dashboard-card neon-card-purple">
                <div className="card-icon">
                  <UserCheck size={24} />
                </div>
                <h2>ACTIVE TUTORS</h2>
                <p className="card-value">
                  {loading ? '...' : summary.total_tutors}
                </p>
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
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="empty-state">
                            No system logs found.
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id}>
                            <td>{log.timestamp}</td>
                            <td>
                              <span className={`alert-level ${String(log.level).toLowerCase()}`}>
                                {log.level}
                              </span>
                            </td>
                            <td>{log.user}</td>
                            <td>{log.action}</td>
                          </tr>
                        ))
                      )}
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