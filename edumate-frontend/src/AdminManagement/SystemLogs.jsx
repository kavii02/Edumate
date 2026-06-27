import { useState, useMemo } from 'react'
import { Search, Filter, AlertTriangle, Info, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

const ALL_LOGS = [
  { id: 1, timestamp: '2026-06-03 12:05:32', level: 'CRITICAL', user: 'Tutor_A', action: 'DB connection failed', module: 'Database', ip: '192.168.1.101' },
  { id: 2, timestamp: '2026-06-03 11:58:14', level: 'INFO', user: 'Admin_B', action: 'User created successfully', module: 'Auth', ip: '192.168.1.45' },
  { id: 3, timestamp: '2026-06-03 12:05:01', level: 'CRITICAL', user: 'Admin_A', action: 'DB connection failed', module: 'Database', ip: '192.168.1.10' },
  { id: 4, timestamp: '2026-06-03 11:50:22', level: 'CRITICAL', user: 'Main_A', action: 'DB connection failed', module: 'Database', ip: '10.0.0.5' },
  { id: 5, timestamp: '2026-06-03 11:45:09', level: 'WARNING', user: 'Student_C', action: 'Failed login attempt (3x)', module: 'Auth', ip: '203.0.113.77' },
  { id: 6, timestamp: '2026-06-03 11:40:55', level: 'INFO', user: 'Admin_B', action: 'Course approved: React Fundamentals', module: 'Courses', ip: '192.168.1.45' },
  { id: 7, timestamp: '2026-06-03 11:35:18', level: 'ERROR', user: 'System', action: 'Email notification service timeout', module: 'Notifications', ip: '—' },
  { id: 8, timestamp: '2026-06-03 11:30:44', level: 'INFO', user: 'Tutor_D', action: 'Course submitted for review', module: 'Courses', ip: '172.16.0.22' },
  { id: 9, timestamp: '2026-06-03 11:25:03', level: 'WARNING', user: 'System', action: 'Memory usage exceeded 80%', module: 'System', ip: '—' },
  { id: 10, timestamp: '2026-06-03 11:20:37', level: 'INFO', user: 'Admin_A', action: 'User role updated: Student → Tutor', module: 'User Management', ip: '192.168.1.10' },
  { id: 11, timestamp: '2026-06-03 11:15:12', level: 'ERROR', user: 'System', action: 'Backup job failed — disk quota exceeded', module: 'System', ip: '—' },
  { id: 12, timestamp: '2026-06-03 11:10:59', level: 'INFO', user: 'Student_E', action: 'Enrolled in: Advanced CSS', module: 'Courses', ip: '198.51.100.4' },
  { id: 13, timestamp: '2026-06-03 11:05:28', level: 'CRITICAL', user: 'System', action: 'Cache service crashed — restarting', module: 'System', ip: '—' },
  { id: 14, timestamp: '2026-06-03 11:00:45', level: 'INFO', user: 'Admin_B', action: 'System settings updated', module: 'Settings', ip: '192.168.1.45' },
  { id: 15, timestamp: '2026-06-03 10:55:11', level: 'WARNING', user: 'Tutor_F', action: 'Large file upload attempted (>500MB)', module: 'Storage', ip: '172.16.0.30' },
]

const LEVEL_CONFIG = {
  CRITICAL: { color: '#ff3333', bg: 'rgba(255,51,51,0.15)', border: 'rgba(255,51,51,0.3)', icon: <AlertTriangle size={14} /> },
  ERROR:    { color: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', icon: <AlertCircle size={14} /> },
  WARNING:  { color: '#facc15', bg: 'rgba(250,204,21,0.15)', border: 'rgba(250,204,21,0.3)', icon: <AlertCircle size={14} /> },
  INFO:     { color: '#38bdf8', bg: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.3)', icon: <Info size={14} /> },
}

const LEVELS = ['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'INFO']
const MODULES = ['ALL', ...Array.from(new Set(ALL_LOGS.map(l => l.module)))]

export default function SystemLogs() {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [moduleFilter, setModuleFilter] = useState('ALL')

  const filtered = useMemo(() => {
    return ALL_LOGS.filter(log => {
      const matchLevel  = levelFilter  === 'ALL' || log.level  === levelFilter
      const matchModule = moduleFilter === 'ALL' || log.module === moduleFilter
      const q = search.toLowerCase()
      const matchSearch = !q || [log.user, log.action, log.module, log.ip, log.timestamp]
        .some(v => v.toLowerCase().includes(q))
      return matchLevel && matchModule && matchSearch
    })
  }, [search, levelFilter, moduleFilter])

  const counts = useMemo(() => ({
    CRITICAL: ALL_LOGS.filter(l => l.level === 'CRITICAL').length,
    ERROR:    ALL_LOGS.filter(l => l.level === 'ERROR').length,
    WARNING:  ALL_LOGS.filter(l => l.level === 'WARNING').length,
    INFO:     ALL_LOGS.filter(l => l.level === 'INFO').length,
  }), [])

  return (
    <div className="system-logs-container">

      {/* Summary badges */}
      <div className="logs-summary-row">
        {Object.entries(counts).map(([level, count]) => {
          const cfg = LEVEL_CONFIG[level]
          return (
            <button
              key={level}
              className="logs-summary-badge"
              style={{
                borderColor: cfg.border,
                background: levelFilter === level ? cfg.bg : 'rgba(10,15,35,0.8)',
                color: cfg.color,
                boxShadow: levelFilter === level ? `0 0 14px ${cfg.color}44` : 'none',
              }}
              onClick={() => setLevelFilter(prev => prev === level ? 'ALL' : level)}
            >
              <span className="logs-badge-icon">{cfg.icon}</span>
              <span className="logs-badge-level">{level}</span>
              <span className="logs-badge-count">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="logs-controls">
        <div className="logs-search">
          <Search size={16} className="control-icon" />
          <input
            placeholder="Search logs by user, action, module, IP…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="logs-filters">
          <div className="logs-filter-group">
            <Filter size={14} className="control-icon" />
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
              {LEVELS.map(l => <option key={l} value={l}>{l === 'ALL' ? 'All Levels' : l}</option>)}
            </select>
          </div>
          <div className="logs-filter-group">
            <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
              {MODULES.map(m => <option key={m} value={m}>{m === 'ALL' ? 'All Modules' : m}</option>)}
            </select>
          </div>
          <button
            className="logs-reset-button"
            onClick={() => { setSearch(''); setLevelFilter('ALL'); setModuleFilter('ALL') }}
          >
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="logs-table-card neon-card-purple">
        <div className="table-header-row" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 className="table-title">System Logs</h2>
            <p className="table-subtitle">{filtered.length} of {ALL_LOGS.length} entries</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Module</th>
                <th>User</th>
                <th>Action</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">No logs match your filters.</td>
                </tr>
              ) : (
                filtered.map((log, idx) => {
                  const cfg = LEVEL_CONFIG[log.level]
                  return (
                    <tr key={log.id}>
                      <td style={{ color: '#475569', fontSize: '0.82rem' }}>{idx + 1}</td>
                      <td style={{ color: '#94a3b8', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                      <td>
                        <span
                          className="alert-level"
                          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                        >
                          <span style={{ marginRight: '0.3rem', display: 'inline-flex', verticalAlign: 'middle' }}>{cfg.icon}</span>
                          {log.level}
                        </span>
                      </td>
                      <td>
                        <span className="logs-module-pill">{log.module}</span>
                      </td>
                      <td style={{ color: '#f8fafc', fontWeight: 600 }}>{log.user}</td>
                      <td style={{ color: '#e2e8f0' }}>{log.action}</td>
                      <td style={{ color: '#64748b', fontSize: '0.88rem', fontFamily: 'monospace' }}>{log.ip}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
