import React, { useState, useEffect } from 'react'
import { UserCheck2, UserX2, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000'

export default function SkillRequests() {
  const studentId = parseInt(localStorage.getItem('edumate_student_id') || '1', 10)

  const [incomingRequests, setIncomingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const [inRes, sentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/skillrequests/incoming/${studentId}`),
        fetch(`${API_BASE_URL}/api/skillrequests/sent/${studentId}`)
      ])

      if (inRes.ok) setIncomingRequests(await inRes.json())
      if (sentRes.ok) setSentRequests(await sentRes.json())
    } catch (err) {
      console.error('Failed to load skill requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/skillrequests/accept/${requestId}`, {
        method: 'PUT'
      })
      if (res.ok) {
        setIncomingRequests(prev =>
          prev.map(r => r.request_id === requestId ? { ...r, status: 'Accepted' } : r)
        )
      }
    } catch (err) {
      console.error('Accept error:', err)
    }
  }

  const handleReject = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/skillrequests/reject/${requestId}`, {
        method: 'PUT'
      })
      if (res.ok) {
        setIncomingRequests(prev =>
          prev.map(r => r.request_id === requestId ? { ...r, status: 'Rejected' } : r)
        )
      }
    } catch (err) {
      console.error('Reject error:', err)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="barter-view-panel">
      <div className="view-panel-header">
        <h2>Skill Barter Logs & Requests</h2>
        <p>Coordinate structural exchange confirmations for incoming requests and view pending sent track logs.</p>
      </div>

      {loading ? (
        <div className="empty-state">Loading skill requests…</div>
      ) : (
        <div className="requests-sections-split">
          {/* Incoming / Received */}
          <div className="request-pane glass-card">
            <div className="pane-title">
              <ArrowDownLeft size={18} className="text-purple" />
              <h3>Received Requests</h3>
            </div>
            <div className="request-list-stack">
              {incomingRequests.length === 0 ? (
                <p className="empty-pane-msg">No pending received requests.</p>
              ) : (
                incomingRequests.map(req => (
                  <div key={req.request_id} className="request-strip-item">
                    <div className="strip-info">
                      <h4>{req.requester_name}</h4>
                      <p>Wants to learn: <span>{req.skill_name}</span></p>
                      <small>{formatDate(req.request_date)}</small>
                    </div>
                    <div className="strip-actions">
                      {req.status === 'Pending' ? (
                        <>
                          <button
                            type="button"
                            className="icon-action-btn accept-btn"
                            onClick={() => handleAccept(req.request_id)}
                            title="Accept Trade"
                          >
                            <UserCheck2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-action-btn delete-btn"
                            onClick={() => handleReject(req.request_id)}
                            title="Reject Trade"
                          >
                            <UserX2 size={16} />
                          </button>
                        </>
                      ) : (
                        <span className={`status-pill ${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sent */}
          <div className="request-pane glass-card">
            <div className="pane-title">
              <ArrowUpRight size={18} className="text-cyan" />
              <h3>Sent Requests Track</h3>
            </div>
            <div className="request-list-stack">
              {sentRequests.length === 0 ? (
                <p className="empty-pane-msg">No sent requests yet.</p>
              ) : (
                sentRequests.map(req => (
                  <div key={req.request_id} className="request-strip-item">
                    <div className="strip-info">
                      <h4>Requested From: {req.provider_name}</h4>
                      <p>Target Subject: <span>{req.skill_name}</span></p>
                      <small>{formatDate(req.request_date)}</small>
                    </div>
                    <div>
                      <span className={`status-pill ${(req.status || '').toLowerCase()}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
