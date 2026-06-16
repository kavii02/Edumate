import React, { useState } from 'react'
import '../index.css'
import { Trash2, CheckCircle } from 'lucide-react'

export default function UserReports() {
  const [reports, setReports] = useState([
    {
      id: 1,
      reportedBy: 'John Doe',
      reportedUser: 'spam_user_123',
      content: 'Inappropriate language in course comments',
      contentType: 'Course Comment',
      reportDate: 'Jun 3, 2026 - 2:45 PM',
      reason: 'Offensive Content',
      status: 'Pending',
      contentPreview: 'The user posted offensive language...'
    },
    {
      id: 2,
      reportedBy: 'Sarah Johnson',
      reportedUser: 'malicious_tutor',
      content: 'Explicit images shared in private message',
      contentType: 'Private Message',
      reportDate: 'Jun 3, 2026 - 1:30 PM',
      reason: 'Explicit Content',
      status: 'Pending',
      contentPreview: 'User shared inappropriate images...'
    },
    {
      id: 3,
      reportedBy: 'Ahmed Ali',
      reportedUser: 'fake_profile',
      content: 'Fake profile with impersonation',
      contentType: 'Profile',
      reportDate: 'Jun 2, 2026 - 11:15 AM',
      reason: 'Impersonation',
      status: 'Resolved',
      contentPreview: 'Profile claims to be a celebrity...'
    },
    {
      id: 4,
      reportedBy: 'Emma Wilson',
      reportedUser: 'spammer_bot',
      content: 'Spam messages advertising illegal services',
      contentType: 'Chat Message',
      reportDate: 'Jun 2, 2026 - 09:20 AM',
      reason: 'Spam',
      status: 'Pending',
      contentPreview: 'Multiple unsolicited messages...'
    },
    {
      id: 5,
      reportedBy: 'Michael Chen',
      reportedUser: 'hate_speaker',
      content: 'Hate speech in course forum',
      contentType: 'Forum Post',
      reportDate: 'Jun 1, 2026 - 3:50 PM',
      reason: 'Hate Speech',
      status: 'Resolved',
      contentPreview: 'User posted hate speech content...'
    }
  ])

  const markAsResolved = (id) => {
    setReports(reports.map(report =>
      report.id === id ? { ...report, status: 'Resolved' } : report
    ))
  }

  const deleteReport = (id) => {
    setReports(reports.filter(report => report.id !== id))
  }

  const getStatusClass = (status) => {
    return status === 'Resolved' ? 'status-resolved' : 'status-pending'
  }

  const getReasonClass = (reason) => {
    const reasonMap = {
      'Offensive Content': 'reason-offensive',
      'Explicit Content': 'reason-explicit',
      'Impersonation': 'reason-impersonation',
      'Spam': 'reason-spam',
      'Hate Speech': 'reason-hate'
    }
    return reasonMap[reason] || 'reason-default'
  }

  const pendingCount = reports.filter(r => r.status === 'Pending').length

  return (
    <div className="user-reports-container">
      <div className="reports-header">
        <div>
          <h2>User Reports</h2>
        </div>
        <div className="reports-stats">
          <div className="stat-badge">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">Total</span>
            <span className="stat-value">{reports.length}</span>
          </div>
        </div>
      </div>

      <div className="reports-list">
        {reports.length === 0 ? (
          <div className="reports-empty">
            <p>No reports at this time.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="report-item neon-card-purple">
              <div className="report-main">
                <div className="report-info">
                  <div className="report-top-row">
                    <h3 className="report-title">{report.content}</h3>
                    <span className={`report-status ${getStatusClass(report.status)}`}>
                      {report.status}
                    </span>
                  </div>

                  <div className="report-meta-row">
                    <div className="meta-item">
                      <span className="meta-label">Reported By:</span>
                      <span className="meta-value">{report.reportedBy}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Reported User:</span>
                      <span className="meta-value meta-username">{report.reportedUser}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Type:</span>
                      <span className="meta-value">{report.contentType}</span>
                    </div>
                  </div>

                  <div className="report-details">
                    <p className="content-preview">{report.contentPreview}</p>
                    <div className="report-footer">
                      <div className="reason-badge">
                        <span className={`reason-label ${getReasonClass(report.reason)}`}>
                          {report.reason}
                        </span>
                      </div>
                      <span className="report-date">{report.reportDate}</span>
                    </div>
                  </div>
                </div>

                <div className="report-actions">
                  {report.status === 'Pending' && (
                    <button
                      type="button"
                      className="action-button resolve-button"
                      onClick={() => markAsResolved(report.id)}
                      title="Mark as Resolved"
                    >
                      <CheckCircle size={18} />
                      <span>Resolve</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => deleteReport(report.id)}
                    title="Delete Report"
                  >
                    <Trash2 size={18} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
