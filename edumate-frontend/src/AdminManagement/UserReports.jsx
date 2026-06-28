import React, { useEffect, useState, useMemo } from 'react'
import '../index.css'
import { Trash2, CheckCircle, Download, FileText, Filter, Search, RefreshCw } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000'

const REASON_CLASSES = {
  'Offensive Content': 'reason-offensive',
  'Explicit Content':  'reason-explicit',
  'Impersonation':     'reason-impersonation',
  'Spam':              'reason-spam',
  'Hate Speech':       'reason-hate',
  'Fake Profile':      'reason-impersonation',
}

export default function UserReports() {
  const [reports, setReports]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showReport, setShowReport]   = useState(false)

  useEffect(() => { fetchReports() }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res  = await fetch(`${API_BASE_URL}/api/admin/user-reports`)
      const data = await res.json()
      if (res.ok) setReports(data)
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsResolved = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/user-reports/${id}/resolve`, { method: 'PUT' })
      if (res.ok) setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Resolved' } : r))
    } catch (err) { console.error('Resolve error:', err) }
  }

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report permanently?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/user-reports/${id}`, { method: 'DELETE' })
      if (res.ok) setReports(prev => prev.filter(r => r.id !== id))
    } catch (err) { console.error('Delete error:', err) }
  }

  /* ── CSV Download ─────────────────────────────────── */
  const downloadCSV = () => {
    const headers = ['ID', 'Reported By', 'Reported User', 'Reason', 'Content Type', 'Content', 'Status', 'Report Date']
    const rows = filtered.map(r => [
      r.id,
      `"${(r.reported_by_name  || '').replace(/"/g, '""')}"`,
      `"${(r.reported_user_name || '').replace(/"/g, '""')}"`,
      `"${(r.reason  || '').replace(/"/g, '""')}"`,
      `"${(r.content_type || '').replace(/"/g, '""')}"`,
      `"${(r.content || '').replace(/"/g, '""')}"`,
      r.status,
      `"${formatDate(r.report_date)}"`
    ])
    const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `user_reports_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  /* ── Filtered list ────────────────────────────────── */
  const filtered = useMemo(() => {
    return reports.filter(r => {
      const q = search.toLowerCase()
      const matchSearch = !q || [
        r.reported_by_name, r.reported_user_name, r.reason, r.content_type, r.content
      ].some(v => String(v || '').toLowerCase().includes(q))
      const matchStatus = statusFilter === 'All' || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [reports, search, statusFilter])

  const pendingCount  = reports.filter(r => r.status === 'Pending').length
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getReasonClass = (reason) => REASON_CLASSES[reason] || 'reason-default'

  /* ── Generated Report Modal ───────────────────────── */
  const ReportSummary = () => (
    <div className="report-modal-overlay" onClick={() => setShowReport(false)}>
      <div className="report-modal-box neon-card-purple" onClick={e => e.stopPropagation()}>
        <div className="report-modal-header">
          <h2>User Reports — Summary</h2>
          <p>Generated: {new Date().toLocaleString()}</p>
        </div>

        <div className="report-summary-grid">
          <div className="report-summary-stat">
            <span className="rs-value">{reports.length}</span>
            <span className="rs-label">Total Reports</span>
          </div>
          <div className="report-summary-stat">
            <span className="rs-value pending-color">{pendingCount}</span>
            <span className="rs-label">Pending</span>
          </div>
          <div className="report-summary-stat">
            <span className="rs-value resolved-color">{resolvedCount}</span>
            <span className="rs-label">Resolved</span>
          </div>
        </div>

        <h3 className="rs-section-title">Breakdown by Reason</h3>
        {['Offensive Content','Explicit Content','Impersonation','Spam','Hate Speech','Fake Profile'].map(reason => {
          const count = reports.filter(r => r.reason === reason).length
          if (!count) return null
          return (
            <div key={reason} className="rs-reason-row">
              <span className={`reason-label ${getReasonClass(reason)}`}>{reason}</span>
              <span className="rs-reason-count">{count} report{count > 1 ? 's' : ''}</span>
            </div>
          )
        })}

        <div className="report-modal-actions">
          <button className="action-button resolve-button" onClick={downloadCSV}>
            <Download size={15} /> Download CSV
          </button>
          <button className="action-button delete-button" onClick={() => setShowReport(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="user-reports-container">

      {showReport && <ReportSummary />}

      {/* Header */}
      <div className="reports-header">
        <div>
          <h2>User Reports</h2>
          <p style={{ color: '#94a3b8', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Review and manage content reports submitted by students.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
          <button type="button" className="action-button resolve-button" onClick={() => setShowReport(true)}>
            <FileText size={15} /> Generate Report
          </button>
          <button type="button" className="action-button view-button" onClick={downloadCSV}>
            <Download size={15} /> Download CSV
          </button>
          <button type="button" className="action-button view-button" onClick={fetchReports}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="reports-controls">
        <div className="reports-search-wrap">
          <Search size={15} className="ctrl-icon" />
          <input
            placeholder="Search by reporter, reason, content type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="reports-filter-wrap">
          <Filter size={14} className="ctrl-icon" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="reports-empty"><p>Loading reports…</p></div>
      ) : filtered.length === 0 ? (
        <div className="reports-empty"><p>No reports found.</p></div>
      ) : (
        <div className="reports-list">
          {filtered.map(report => (
            <div key={report.id} className="report-item neon-card-purple">
              <div className="report-main">
                <div className="report-info">
                  <div className="report-top-row">
                    <h3 className="report-title">{report.content || 'No content description'}</h3>
                    <span className={`report-status ${report.status === 'Resolved' ? 'status-resolved' : 'status-pending'}`}>
                      {report.status}
                    </span>
                  </div>

                  <div className="report-meta-row">
                    <div className="meta-item">
                      <span className="meta-label">Reported By:</span>
                      <span className="meta-value">{report.reported_by_name || '—'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Reported User:</span>
                      <span className="meta-value meta-username">{report.reported_user_name || '—'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Type:</span>
                      <span className="meta-value">{report.content_type || '—'}</span>
                    </div>
                  </div>

                  <div className="report-details">
                    <div className="report-footer">
                      <div className="reason-badge">
                        <span className={`reason-label ${getReasonClass(report.reason)}`}>
                          {report.reason}
                        </span>
                      </div>
                      <span className="report-date">{formatDate(report.report_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="report-actions">
                  {report.status === 'Pending' && (
                    <button
                      type="button"
                      className="action-button resolve-button"
                      onClick={() => markAsResolved(report.id)}
                    >
                      <CheckCircle size={16} /> Resolve
                    </button>
                  )}
                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() => deleteReport(report.id)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
