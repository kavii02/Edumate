import React from 'react'
import { Sparkles, ArrowLeftRight, UserCheck } from 'lucide-react'

const MOCK_MATCHES = [
  { id: 1, peer: 'Nimal Rathnayake', score: '98% Synergy Match', canTeach: 'Java OOP Principles', wants: 'Database Normalization', avatar: '💻' },
  { id: 2, peer: 'Sarah Johnson', score: '85% Synergy Match', canTeach: 'SQL Subqueries', wants: 'Python Loops & Lists', avatar: '✨' }
]

export default function PeerMatching() {
  return (
    <div className="barter-view-panel">
      <div className="view-panel-header">
        <div className="row-layout">
          <div>
            <h2>Intelligent Peer Matching</h2>
            <p>Smart Rule-Based matching recommending peers based on complementary system profiles.</p>
          </div>
          {/* <span className="ai-engine-badge">
            <Sparkles size={14} /> Rule-Engine Active
          </span> */}
        </div>
      </div>

      <div className="matching-container-grid">
        {MOCK_MATCHES.map((match) => (
          <div key={match.id} className="matching-neon-card glass-card">
            <div className="match-score-header">
              <div className="peer-avatar-circle">{match.avatar}</div>
              <div>
                <h3>{match.peer}</h3>
                <span className="match-score-text">{match.score}</span>
              </div>
            </div>

            <div className="barter-exchange-info-box">
              <div className="exchange-lane">
                <small>THEY CAN TEACH YOU</small>
                <p className="teach-text">{match.canTeach}</p>
              </div>
              <div className="exchange-divider-icon">
                <ArrowLeftRight size={16} />
              </div>
              <div className="exchange-lane">
                <small>IN EXCHANGE FOR YOUR</small>
                <p className="wants-text">{match.wants}</p>
              </div>
            </div>

            <button type="button" className="barter-action-btn primary full-width" onClick={() => alert(`Connect initialized with ${match.peer}`)}>
              <UserCheck size={16} />
              <span>Propose Mutual Barter Connection</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}