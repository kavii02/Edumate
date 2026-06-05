import React, { useState } from 'react'
import { BookOpen, User, GitPullRequest, Users2 } from 'lucide-react'
import BrowseSkills from './BrowseSkills'
import MySkills from './MySkills'
import SkillRequests from './SkillRequests'
import PeerMatching from './PeerMatching'
import './SkillBarter.css'

export default function SkillBarterContainer() {
  const [activeSubTab, setActiveSubTab] = useState('Browse Skills')

  const subNavItems = [
    { name: 'Browse Skills', icon: <BookOpen size={18} /> },
    { name: 'My Skills', icon: <User size={18} /> },
    { name: 'Skill Requests', icon: <GitPullRequest size={18} /> },
    { name: 'Peer Matching', icon: <Users2 size={18} /> }
  ]

  return (
    <div className="barter-layout">
      {/* Internal Sub-Navigation Sidebar */}
      <aside className="barter-sidebar">
        <div className="barter-sidebar-header">
          <h3>Skill Barter</h3>
          <p>Exchange ICT Knowledge</p>
        </div>
        <nav className="barter-nav">
          {subNavItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`barter-nav-btn ${activeSubTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveSubTab(item.name)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Barter Content Viewport Area */}
      <main className="barter-viewport">
        {activeSubTab === 'Browse Skills' && <BrowseSkills />}
        {activeSubTab === 'My Skills' && <MySkills />}
        {activeSubTab === 'Skill Requests' && <SkillRequests />}
        {activeSubTab === 'Peer Matching' && <PeerMatching />}
      </main>
    </div>
  )
}