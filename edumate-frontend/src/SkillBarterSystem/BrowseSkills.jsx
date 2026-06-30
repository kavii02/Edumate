import React, { useState } from 'react'
import { Search, Filter, MessageSquareCode } from 'lucide-react'

const MOCK_AVAILABLE_SKILLS = [
  { id: 1, student: 'Kamal Silva', skill: 'Java OOP', category: 'Programming', level: 'Advanced', desc: 'Can help clear structures, classes, inheritance, and exception handling.' },
  { id: 2, student: 'Nishami Fernando', skill: 'SQL Database Design', category: 'Database Engineering', level: 'Intermediate', desc: 'Understanding ER diagrams and database normalization rules (1NF, 2NF, 3NF).' },
  { id: 3, student: 'Sahan Perera', skill: 'CSS Flexbox & Grid', category: 'Web Development', level: 'Expert', desc: 'Responsive web UI layout architecture and modern responsive styling layouts.' },
  { id: 4, student: 'Thilina Rathnayake', skill: 'IP Addressing & Subnetting', category: 'Networking', level: 'Intermediate', desc: 'Breaking down IPv4 addressing networks into efficient logical segments.' }
]

const AVAILABLE_CATEGORIES = ['All', ...Array.from(new Set(MOCK_AVAILABLE_SKILLS.map((item) => item.category)))]

export default function BrowseSkills() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const filteredSkills = MOCK_AVAILABLE_SKILLS.filter((item) => {
    const searchTerm = search.trim().toLowerCase()
    const matchesSearch =
      !searchTerm ||
      [item.skill, item.desc, item.student, item.category].some((field) =>
        field.toLowerCase().includes(searchTerm)
      )

    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter

    return matchesSearch && matchesCat
  })

  const handleRequestSkill = (skillId) => {
    alert(`Skill Barter Request sent for Skill ID: ${skillId}. Waiting for Peer response!`)
  }

  return (
    <div className="barter-view-panel">
      <div className="view-panel-header">
        <div>
          <h2>Browse Available Peer Skills</h2>
          <p>Find A/L ICT study peers to learn new technical competencies from.</p>
        </div>
      </div>

      {/* Filter and Search Action Toolbars */}
      <div className="barter-toolbar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            placeholder="Search skills, topics, concepts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-wrapper">
          <Filter size={16} className="filter-box-icon" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {AVAILABLE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid displaying the available skills */}
      {filteredSkills.length === 0 ? (
        <div className="empty-state">
          No matching skills found. Try a broader keyword or select a different category.
        </div>
      ) : (
        <div className="barter-grid">
          {filteredSkills.map((item) => (
            <div key={item.id} className="barter-card glass-card">
              <div className="card-badge-row">
                <span className="category-pill">{item.category}</span>
                <span className={`level-badge ${item.level.toLowerCase()}`}>{item.level}</span>
              </div>
              <h3>{item.skill}</h3>
              <p className="card-owner">Offered by: <span>{item.student}</span></p>
              <p className="card-description">{item.desc}</p>

              <button
                type="button"
                className="barter-action-btn primary"
                onClick={() => handleRequestSkill(item.id)}
              >
                <MessageSquareCode size={16} />
                <span>Request Skill</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}