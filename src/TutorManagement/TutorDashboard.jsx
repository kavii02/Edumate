import '../index.css'
import { useState } from 'react'
import {
  LayoutGrid,
  BookOpen,
  Users,
  BarChart3,
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
  { name: 'My Students', icon: <Users size={18} /> },
  { name: 'Earnings', icon: <BarChart3 size={18} /> },
  { name: 'Settings', icon: <Settings size={18} /> }
]

export default function TutorDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('Dashboard')

  return (
    <div className="admin-dashboard-shell">
      <div className="admin-dashboard-backdrop" />
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">E</div>
          <div>
            <p className="sidebar-label">EduMate</p>
            <span className="sidebar-note">Tutor Portal</span>
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
            <p className="page-subtitle">Tutor Portal</p>
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
              Tutor
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
                <h2>Active Courses</h2>
                <p className="card-value">3</p>
                <p className="card-meta">Courses teaching</p>
              </div>
              <div className="dashboard-card neon-card">
                <h2>Total Students</h2>
                <p className="card-value">42</p>
                <p className="card-meta">Enrolled students</p>
              </div>
              <div className="dashboard-card neon-card">
                <h2>Monthly Earnings</h2>
                <p className="card-value">$1,250</p>
                <p className="card-meta">This month</p>
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-card neon-card">
                <h2>Recent Activity</h2>
                <ul>
                  <li>Posted: Module 5 Content</li>
                  <li>Graded: 5 Assignments</li>
                  <li>New Student: 1 enrolled</li>
                </ul>
              </div>
              <div className="dashboard-panel-card neon-card">
                <h2>Quick Actions</h2>
                <button className="submit-button">Create Assignment</button>
                <button className="submit-button outline">View Submissions</button>
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
