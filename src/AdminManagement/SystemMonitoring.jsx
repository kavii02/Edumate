import React from 'react'
import '../index.css'

export default function SystemMonitoring() {
  const loginLogs = [
    {
      id: 1,
      user: 'admin@edumate.com',
      loginTime: '2:30 PM',
      loginDate: 'Jun 3, 2026',
      device: 'Windows PC',
      ipAddress: '192.168.1.101',
      status: 'Success'
    },
    {
      id: 2,
      user: 'tutor@edumate.com',
      loginTime: '1:45 PM',
      loginDate: 'Jun 3, 2026',
      device: 'iPhone',
      ipAddress: '203.45.67.89',
      status: 'Success'
    },
    {
      id: 3,
      user: 'student@edumate.com',
      loginTime: '1:15 PM',
      loginDate: 'Jun 3, 2026',
      device: 'Android',
      ipAddress: '192.168.1.45',
      status: 'Success'
    },
    {
      id: 4,
      user: 'invalid_user@edumate.com',
      loginTime: '12:50 PM',
      loginDate: 'Jun 3, 2026',
      device: 'MacBook',
      ipAddress: '10.0.0.55',
      status: 'Failed'
    }
  ]

  const userActivities = [
    {
      id: 1,
      user: 'Dr. Arjuna Perera',
      activity: 'Course Submitted',
      timestamp: 'Jun 3, 2026 - 11:30 AM',
      type: 'Course'
    },
    {
      id: 2,
      user: 'Ms. Dilani Silva',
      activity: 'Profile Updated',
      timestamp: 'Jun 3, 2026 - 10:15 AM',
      type: 'Profile'
    },
    {
      id: 3,
      user: 'Mr. Deman Silva',
      activity: 'Course Approved',
      timestamp: 'Jun 2, 2026 - 4:45 PM',
      type: 'Course'
    },
    {
      id: 4,
      user: 'Admin User',
      activity: 'System Configuration Changed',
      timestamp: 'Jun 2, 2026 - 3:20 PM',
      type: 'System'
    },
    {
      id: 5,
      user: 'John Doe',
      activity: 'Enrolled in Course',
      timestamp: 'Jun 2, 2026 - 2:10 PM',
      type: 'Enrollment'
    }
  ]

  const reports = [
    {
      id: 1,
      title: 'Daily Active Users',
      value: '2,450',
      change: '+12%',
      changeType: 'positive',
      metric: 'Today vs Yesterday'
    },
    {
      id: 2,
      title: 'New Courses',
      value: '23',
      change: '+5',
      changeType: 'positive',
      metric: 'This Month'
    },
    {
      id: 3,
      title: 'Failed Logins',
      value: '12',
      change: '-2',
      changeType: 'positive',
      metric: 'Last 24 Hours'
    },
    {
      id: 4,
      title: 'System Uptime',
      value: '99.98%',
      change: '+0.02%',
      changeType: 'positive',
      metric: 'This Month'
    }
  ]

  const getActivityTypeClass = (type) => {
    const typeMap = {
      Course: 'activity-type-course',
      Profile: 'activity-type-profile',
      System: 'activity-type-system',
      Enrollment: 'activity-type-enrollment'
    }
    return typeMap[type] || 'activity-type-default'
  }

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
                <span className={`change-indicator ${report.changeType}`}>
                  {report.change}
                </span>
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
                  <th>LOGIN TIME</th>
                  <th>DATE</th>
                  <th>DEVICE</th>
                  <th>IP ADDRESS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.user}</td>
                    <td>{log.loginTime}</td>
                    <td>{log.loginDate}</td>
                    <td>{log.device}</td>
                    <td>{log.ipAddress}</td>
                    <td>
                      <span className={`log-status ${log.status.toLowerCase()}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* User Activities Section */}
      <section className="monitoring-activities-section">
        <h2 className="section-title">User Activities</h2>
        <div className="activities-card neon-card-purple">
          <div className="activities-list">
            {userActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-content">
                  <div className="activity-header">
                    <h3>{activity.user}</h3>
                    <span className={`activity-type ${getActivityTypeClass(activity.type)}`}>
                      {activity.type}
                    </span>
                  </div>
                  <p className="activity-description">{activity.activity}</p>
                  <p className="activity-timestamp">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
