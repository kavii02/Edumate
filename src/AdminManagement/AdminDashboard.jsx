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

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Dashboard')

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
            <h1 className="page-title">{activeTab}</h1>
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
        ) : activeTab === 'Dashboard' ? (
          <>
            <section className="dashboard-grid">
              <div className="dashboard-card neon-card">
                <h2>Users</h2>
                <p className="card-value">1,250</p>
                <p className="card-meta">Active students & tutors</p>
              </div>
              <div className="dashboard-card neon-card">
                <h2>Classes</h2>
                <p className="card-value">98</p>
                <p className="card-meta">Ongoing sessions</p>
              </div>
              <div className="dashboard-card neon-card">
                <h2>Reports</h2>
                <p className="card-value">24</p>
                <p className="card-meta">Pending reviews</p>
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-card neon-card">
                <h2>System status</h2>
                <ul>
                  <li>Server uptime: <strong>99.98%</strong></li>
                  <li>New signups: <strong>42 today</strong></li>
                  <li>Support tickets: <strong>3 unresolved</strong></li>
                </ul>
              </div>
              <div className="dashboard-panel-card neon-card">
                <h2>Quick actions</h2>
                <button className="submit-button">Create announcement</button>
                <button className="submit-button outline">Review reports</button>
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
