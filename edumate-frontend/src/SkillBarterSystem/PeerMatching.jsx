import React, { useEffect, useState } from 'react'
import { ArrowLeftRight, UserCheck, RefreshCw } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000'

export default function PeerMatching() {
  const studentId = parseInt(localStorage.getItem('edumate_student_id') || '1', 10)

  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/recommendations/${studentId}`)
      const data = await res.json()
      if (res.ok) setMatches(data)
    } catch (err) {
      console.error('Failed to load peer matches:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePropose = async (match) => {
    if (!match.teach_skill_id) {
      alert('Unable to identify the skill. Please try browsing skills instead.')
      return
    }

    setRequesting(match.student_id)
    try {
      const res = await fetch(`${API_BASE_URL}/api/skillrequests/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_student_id: studentId,
          provider_student_id: match.student_id,
          skill_id: match.teach_skill_id
        })
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Barter connection proposed to ${match.peer_name}!`)
      } else {
        alert(data.error || 'Failed to send barter request.')
      }
    } catch (err) {
      console.error('Propose error:', err)
      alert('Server error. Please try again.')
    } finally {
      setRequesting(null)
    }
  }

  if (loading) {
    return (
      <div className="barter-view-panel">
        <div className="empty-state">Finding matching peers…</div>
      </div>
    )
  }

  return (
    <div className="barter-view-panel">
      <div className="view-panel-header">
        <div className="row-layout">
          <div>
            <h2>Intelligent Peer Matching</h2>
            <p>Smart Rule-Based matching recommending peers based on complementary system profiles.</p>
          </div>
          <button
            type="button"
            className="barter-action-btn outline"
            onClick={fetchMatches}
            style={{ marginLeft: 'auto' }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state">
          No peer matches found. Add skills to your profile first so the system can find compatible peers.
        </div>
      ) : (
        <div className="matching-container-grid">
          {matches.map((match) => (
            <div key={match.student_id} className="matching-neon-card glass-card">
              <div className="match-score-header">
                <div className="peer-avatar-circle">{match.avatar}</div>
                <div>
                  <h3>{match.peer_name}</h3>
                  <span className="match-score-text">{match.score_label}</span>
                </div>
              </div>

              <div className="barter-exchange-info-box">
                <div className="exchange-lane">
                  <small>THEY CAN TEACH YOU</small>
                  <p className="teach-text">{match.can_teach}</p>
                </div>
                <div className="exchange-divider-icon">
                  <ArrowLeftRight size={16} />
                </div>
                <div className="exchange-lane">
                  <small>IN EXCHANGE FOR YOUR</small>
                  <p className="wants-text">{match.wants}</p>
                </div>
              </div>

              <button
                type="button"
                className="barter-action-btn primary full-width"
                onClick={() => handlePropose(match)}
                disabled={requesting === match.student_id}
              >
                <UserCheck size={16} />
                <span>
                  {requesting === match.student_id
                    ? 'Sending…'
                    : 'Propose Mutual Barter Connection'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}