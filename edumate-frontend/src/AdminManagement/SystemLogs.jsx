import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, AlertTriangle, Info, AlertCircle, RefreshCw } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000'

const LEVEL_CONFIG = {
  CRITICAL: { color: '#ff3333', bg: 'rgba(255,51,51,0.15)', border: 'rgba(255,51,51,0.3)', icon: <AlertTriangle size={14} /> },
  ERROR:    { color: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', icon: <AlertCircle size={14} /> },
  WARNING:  { color: '#facc15', bg: 'rgba(250,204,21,0.15)', border: 'rgba(250,204,21,0.3)', icon: <AlertCircle size={14} /> },
  INFO:     { color: '#38bdf8', bg: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.3)', icon: <Info size={14} /> },
}

const LEVELS = ['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'INFO']

export default function SystemLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [moduleFilter, setModuleFilter] = useState('ALL')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/admin/system-logs`)
      const data = await res.json()
      if (res.ok) setLogs(data)
    } catch (err) {
      console.error('Failed to load system logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const modules = useMemo(() => (
    ['ALL', ...Array.from(new Set(logs.map(l => l.module).filter(Boolean)))]
  ), [logs])

  const filtered = useMemo(() => {
    return logs.filter(log => {
      const matchLevel  = levelFilter  === 'ALL' || log.level  === levelFilter
      const matchModule = moduleFilter === 'ALL' || log.module === moduleFilter
      const q = search.toLowerCase()
      const matchSearch = !q || [log.user, log.action, log.module, log.ip, log.timestamp]
        .some(v => String(v || '').toLowerCase().includes(q))
      return matchLevel && matchModule && matchSearch
    })
  }, [logs, search, levelFilter, moduleFilter])

  const counts = useMemo(() => ({
    CRITICAL: logs.filter(l => l.level === 'CRITICAL').length,
    ERROR:    logs.filter(l => l.level === 'ERROR').length,
    WARNING:  logs.filter(l => l.level === 'WARNING').length,
    INFO:     logs.filter(l => l.level === 'INFO').length,
  }), [logs])

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
              {modules.map(m => <option key={m} value={m}>{m === 'ALL' ? 'All Modules' : m}</option>)}
            </select>
          </div>
          <button
            className="logs-reset-button"
            onClick={() => { setSearch(''); setLevelFilter('ALL'); setModuleFilter('ALL'); fetchLogs() }}
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
            <p className="table-subtitle">
              {loading ? 'Loading…' : `${filtered.length} of ${logs.length} entries`}
            </p>
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="empty-state">Loading system logs…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">No logs match your filters.</td>
                </tr>
              ) : (
                filtered.map((log, idx) => {
                  const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.INFO
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
                      <td style={{ color: '#64748b', fontSize: '0.88rem', fontFamily: 'monospace' }}>{log.ip || '—'}</td>
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
