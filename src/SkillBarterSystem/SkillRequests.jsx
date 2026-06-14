import React, { useState } from 'react'
import { UserCheck2, UserX2, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default function SkillRequests() {
  const [incomingRequests, setIncomingRequests] = useState([
    { id: 101, sender: 'Kamal Wijesekare', skillRequested: 'Python Basics', date: 'Jun 4, 2026', status: 'Pending' },
    { id: 102, sender: 'Dilani Silva', skillRequested: 'HTML Semantic Structure', date: 'Jun 3, 2026', status: 'Pending' }
  ])

  const [sentRequests] = useState([
    { id: 201, recipient: 'Dr. Arjuna Perera', skillTarget: 'Advanced Data Science Intro', date: 'Jun 2, 2026', status: 'Accepted' },
    { id: 202, recipient: 'Nishami Fernando', skillTarget: 'SQL Database Design', date: 'Jun 4, 2026', status: 'Pending' }
  ])

  const handleAccept = (id) => {
    setIncomingRequests(incomingRequests.map(req => req.id === id ? { ...req, status: 'Accepted' } : req))
  }

  const handleReject = (id) => {
    setIncomingRequests(incomingRequests.filter(req => req.id !== id))
  }

  return (
    <div className="barter-view-panel">
      <div className="view-panel-header">
        <h2>Skill Barter Logs & Requests</h2>
        <p>Coordinate structural exchange confirmations for incoming requests and view pending sent track logs.</p>
      </div>

      <div className="requests-sections-split">
        {/* Incoming Section */}
        <div className="request-pane glass-card">
          <div className="pane-title">
            <ArrowDownLeft size={18} className="text-purple" />
            <h3>Received Requests</h3>
          </div>
          <div className="request-list-stack">
            {incomingRequests.map(req => (
              <div key={req.id} className="request-strip-item">
                <div className="strip-info">
                  <h4>{req.sender}</h4>
                  <p>Wants to learn: <span>{req.skillRequested}</span></p>
                  <small>{req.date}</small>
                </div>
                <div className="strip-actions">
                  {req.status === 'Pending' ? (
                    <>
                      <button type="button" className="icon-action-btn accept-btn" onClick={() => handleAccept(req.id)} title="Accept Trade">
                        <UserCheck2 size={16} />
                      </button>
                      <button type="button" className="icon-action-btn delete-btn" onClick={() => handleReject(req.id)} title="Reject Trade">
                        <UserX2 size={16} />
                      </button>
                    </>
                  ) : (
                    <span className="status-pill accepted">{req.status}</span>
                  )}
                </div>
              </div>
            ))}
            {incomingRequests.length === 0 && <p className="empty-pane-msg">No pending received requests.</p>}
          </div>
        </div>

        {/* Sent Section */}
        <div className="request-pane glass-card">
          <div className="pane-title">
            <ArrowUpRight size={18} className="text-cyan" />
            <h3>Sent Requests Track</h3>
          </div>
          <div className="request-list-stack">
            {sentRequests.map(req => (
              <div key={req.id} className="request-strip-item">
                <div className="strip-info">
                  <h4>Requested From: {req.recipient}</h4>
                  <p>Target Subject: <span>{req.skillTarget}</span></p>
                  <small>{req.date}</small>
                </div>
                <div>
                  <span className={`status-pill ${req.status.toLowerCase()}`}>{req.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}