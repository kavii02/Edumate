import React, { useState } from 'react'
import {
  BookOpen,
  User,
  GitPullRequest,
  Users2,
  Sparkles,
  MessageCircle
} from 'lucide-react'

import BrowseSkills from './BrowseSkills'
import MySkills from './MySkills'
import SkillRequests from './SkillRequests'
import PeerMatching from './PeerMatching'
import SkillMessages from './SkillMessages'
import './SkillBarter.css'

export default function SkillBarterContainer() {
  const [activeSubTab, setActiveSubTab] = useState('Browse Skills')

  const subNavItems = [
    {
      name: 'Browse Skills',
      icon: <BookOpen size={18} />
    },
    {
      name: 'My Skills',
      icon: <User size={18} />
    },
    {
      name: 'Skill Requests',
      icon: <GitPullRequest size={18} />
    },
    {
      name: 'Peer Matching',
      icon: <Users2 size={18} />
    },
    {
      name: 'Messages',
      icon: <MessageCircle size={18} />
    }
  ]

  const renderContent = () => {
    switch (activeSubTab) {
      case 'Browse Skills':
        return <BrowseSkills />

      case 'My Skills':
        return <MySkills />

      case 'Skill Requests':
        return <SkillRequests />

      case 'Peer Matching':
        return <PeerMatching />

      case 'Messages':
        return <SkillMessages />

      default:
        return <BrowseSkills />
    }
  }

  return (
    <div className="barter-layout">

      {/* Sidebar */}
      <aside className="barter-sidebar">
        <div className="barter-sidebar-header">
          <div className="sidebar-brand">
            <div className="logo-circle" aria-hidden>
              <Sparkles size={20} />
            </div>
            <div className="brand-text">
              <h3>Skill Barter</h3>
              <p>Skill Exchange</p>
            </div>
          </div>
        </div>

        <nav className="barter-nav" role="navigation" aria-label="Skill barter navigation">
          {subNavItems.map((item) => (
            <button
              key={item.name}
              type="button"
              title={item.name}
              aria-current={activeSubTab === item.name ? 'true' : undefined}
              className={`barter-nav-btn ${activeSubTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveSubTab(item.name)}
            >
              <span className="nav-icon" aria-hidden>{item.icon}</span>
              <span className="nav-label">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer" aria-hidden>
          <p>EduMate LMS</p>
          <small>Skill Exchange Module</small>
        </div>
      </aside>

      {/* Main Content */}
      <main className="barter-viewport">

        <div className="page-top-banner">
          <div>
            <h1>Skill Barter System</h1>
            {/* <p>Connect with peers and trade ICT skills.</p> */}
          </div>

          {/* <div className="banner-badge">
            Peer network
          </div> */}
        </div>

        {renderContent()}

      </main>

    </div>
  )
}