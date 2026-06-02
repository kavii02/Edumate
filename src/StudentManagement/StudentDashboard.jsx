import '../index.css'
import { useState } from 'react'
import {
  LayoutGrid,
  BookOpen,
  Award,
  Clock,
  Settings,
  Bell,
  Mail,
  ChevronDown,
  ChevronRight,
  User
} from 'lucide-react'
import { Activity } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', icon: <LayoutGrid size={18} /> },
  { name: 'My Courses', icon: <BookOpen size={18} /> },
  { name: 'My Skills', icon: <Award size={18} /> },
  { name: 'Progress', icon: <Clock size={18} /> },
  { name: 'Settings', icon: <Settings size={18} /> }
]

export default function StudentDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Dashboard')

  return (
    <div className="admin-dashboard-shell">
      <div className="admin-dashboard-backdrop" />
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">E</div>
          <div>
            <p className="sidebar-label">EduMate</p>
            <span className="sidebar-note">Student Portal</span>
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
            <p className="page-subtitle">Student Portal</p>
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
              <User size={16} />
              Student
              <ChevronDown size={16} />
            </button>
            <button className="logout-pill" type="button" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </header>

        {activeTab === 'Dashboard' ? (
          <>
            <section className="dashboard-grid">
              <div className="dashboard-card neon-card">
                <h2>Enrolled Courses</h2>
                <p className="card-value">5</p>
                <p className="card-meta">Active courses</p>
              </div>
              <div className="dashboard-card neon-card">
                <h2>Skills Progress</h2>
                <p className="card-value">12</p>
                <p className="card-meta">Skills learned</p>
              </div>
              <div className="dashboard-card neon-card">
                <h2>Achievements</h2>
                <p className="card-value">8</p>
                <p className="card-meta">Badges earned</p>
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-card neon-card">
                <h2>Recent Activity</h2>
                <ul>
                  <li>Completed Course: Web Development</li>
                  <li>Earned Badge: Python Master</li>
                  <li>Started: Advanced React</li>
                </ul>
              </div>
              <div className="dashboard-panel-card neon-card">
                <h2>Quick Links</h2>
                <button className="submit-button">Browse Courses</button>
                <button className="submit-button outline">View Skills</button>
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
