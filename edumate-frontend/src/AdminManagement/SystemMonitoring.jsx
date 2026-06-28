import React, { useEffect, useState } from 'react'
import '../index.css'

const API_BASE_URL = 'http://localhost:5000'

export default function SystemMonitoring() {
  const [loginLogs, setLoginLogs] = useState([])
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({
    active_today: 0,
    new_courses_month: 0,
    failed_logins_24h: 0,
    total_users: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)

      const [statsRes, logsRes, activityRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/monitoring-stats`),
        fetch(`${API_BASE_URL}/api/admin/login-logs`),
        fetch(`${API_BASE_URL}/api/admin/system-logs`)
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      if (logsRes.ok) {
        const data = await logsRes.json()
        setLoginLogs(data)
      }

      if (activityRes.ok) {
        const data = await activityRes.json()
        setActivities(data.slice(0, 8))
      }
    } catch (err) {
      console.error('SystemMonitoring fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatLoginTime = (loginTime) => {
    if (!loginTime) return '—'
    const d = new Date(loginTime)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const formatLoginDate = (loginTime) => {
    if (!loginTime) return '—'
    const d = new Date(loginTime)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getActivityTypeClass = (module) => {
    const m = (module || '').toLowerCase()
    if (m.includes('course')) return 'activity-type-course'
    if (m.includes('auth') || m.includes('security')) return 'activity-type-profile'
    if (m.includes('system') || m.includes('settings')) return 'activity-type-system'
    if (m.includes('skill') || m.includes('barter')) return 'activity-type-enrollment'
    return 'activity-type-default'
  }

  const getActivityLabel = (module) => {
    const m = (module || '').toLowerCase()
    if (m.includes('course')) return 'Course'
    if (m.includes('auth') || m.includes('security')) return 'Auth'
    if (m.includes('system') || m.includes('settings')) return 'System'
    if (m.includes('skill') || m.includes('barter')) return 'Skill Barter'
    return module || 'General'
  }

  const reports = [
    {
      id: 1,
      title: 'Active Users Today',
      value: loading ? '…' : String(stats.active_today),
      metric: 'Successful logins today'
    },
    {
      id: 2,
      title: 'New Courses',
      value: loading ? '…' : String(stats.new_courses_month),
      metric: 'This month'
    },
    {
      id: 3,
      title: 'Failed Logins',
      value: loading ? '…' : String(stats.failed_logins_24h),
      metric: 'Last 24 hours'
    },
    {
      id: 4,
      title: 'Total Users',
      value: loading ? '…' : String(stats.total_users),
      metric: 'Students + Tutors'
    }
  ]

  return (
    <div className="system-monitoring-container">

      {/* Reports Section */}
      <section className="monitoring-reports-section">
        <h2 className="section-title">System Reports</h2>
        <div className="reports-grid">
          {reports.map((report) => (
            <div key={report.id} className="report-card neon-card-purple">
              <h3>{report.title}</h3>
              <p className="report-value">{report.value}</p>
              <div className="report-change">
                <span className="report-metric">{report.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Login Logs Section */}
      <section className="monitoring-logs-section">
        <h2 className="section-title">Login Logs</h2>
        <div className="logs-card neon-card-purple">
          <div className="table-wrapper">
            <table className="monitoring-table">
              <thead>
                <tr>
                  <th>USER EMAIL</th>
                  <th>ROLE</th>
                  <th>LOGIN TIME</th>
                  <th>DATE</th>
                  <th>DEVICE</th>
                  <th>IP ADDRESS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="empty-state">Loading login logs…</td></tr>
                ) : loginLogs.length === 0 ? (
                  <tr><td colSpan={7} className="empty-state">No login records found.</td></tr>
                ) : (
                  loginLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.user_email}</td>
                      <td>{log.role}</td>
                      <td>{formatLoginTime(log.login_time)}</td>
                      <td>{formatLoginDate(log.login_time)}</td>
                      <td>{log.device || '—'}</td>
                      <td>{log.ip_address || '—'}</td>
                      <td>
                        <span className={`log-status ${(log.status || '').toLowerCase()}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* User Activities Section */}
      <section className="monitoring-activities-section">
        <h2 className="section-title">Recent System Activity</h2>
        <div className="activities-card neon-card-purple">
          <div className="activities-list">
            {loading ? (
              <p className="activity-timestamp" style={{ padding: '1rem' }}>Loading activity…</p>
            ) : activities.length === 0 ? (
              <p className="activity-timestamp" style={{ padding: '1rem' }}>No recent activity found.</p>
            ) : (
              activities.map((entry) => (
                <div key={entry.id} className="activity-item">
                  <div className="activity-content">
                    <div className="activity-header">
                      <h3>{entry.user}</h3>
                      <span className={`activity-type ${getActivityTypeClass(entry.module)}`}>
                        {getActivityLabel(entry.module)}
                      </span>
                    </div>
                    <p className="activity-description">{entry.action}</p>
                    <p className="activity-timestamp">{entry.timestamp}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
