import React, { useEffect, useState } from 'react'
import { Search, Filter, MessageSquareCode } from 'lucide-react'

const CURRENT_STUDENT_ID = 1
const API_BASE_URL = 'http://localhost:5000'

export default function BrowseSkills() {
  const [skills, setSkills] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  const fetchSkills = async () => {
    try {
      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/api/skills`)
      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to load skills')
        return
      }

      setSkills(data)
    } catch (error) {
      console.error('Error loading skills:', error)
      alert('Server error. Please check backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const categories = [
    'All',
    ...Array.from(
      new Set(
        skills
          .map((item) => item.category)
          .filter(Boolean)
      )
    )
  ]

  const filteredSkills = skills.filter((item) => {
    const searchTerm = search.trim().toLowerCase()

    const matchesSearch =
      !searchTerm ||
      [
        item.skill,
        item.name,
        item.description,
        item.desc,
        item.student_name,
        item.category,
        item.level
      ].some((field) =>
        String(field || '').toLowerCase().includes(searchTerm)
      )

    const matchesCategory =
      categoryFilter === 'All' || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleRequestSkill = async (skill) => {
    if (skill.student_id === CURRENT_STUDENT_ID) {
      alert('You cannot request your own skill.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/skillrequests/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requester_student_id: CURRENT_STUDENT_ID,
          provider_student_id: skill.student_id,
          skill_id: skill.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to send request')
        return
      }

      alert('Skill request sent successfully!')
    } catch (error) {
      console.error('Request error:', error)
      alert('Server error. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="barter-view-panel">
        <div className="empty-state">
          Loading available peer skills...
        </div>
      </div>
    )
  }

  return (
    <div className="barter-view-panel">
      <div className="view-panel-header">
        <div>
          <h2>Browse Available Peer Skills</h2>
          <p>
            Find A/L ICT study peers to learn new technical competencies from.
          </p>
        </div>
      </div>

      <div className="barter-toolbar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            placeholder="Search skills, topics, students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-wrapper">
          <Filter size={16} className="filter-box-icon" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="empty-state">
          No matching skills found. Try another keyword or category.
        </div>
      ) : (
        <div className="barter-grid">
          {filteredSkills.map((item) => (
            <div key={item.id} className="barter-card glass-card">
              <div className="card-badge-row">
                <span className="category-pill">
                  {item.category || 'General'}
                </span>

                <span
                  className={`level-badge ${
                    item.level ? item.level.toLowerCase() : 'beginner'
                  }`}
                >
                  {item.level || 'Beginner'}
                </span>
              </div>

              <h3>{item.skill || item.name}</h3>

              <p className="card-owner">
                Offered by: <span>{item.student_name || 'Unknown Student'}</span>
              </p>

              <p className="card-description">
                {item.desc || item.description || 'No description provided.'}
              </p>

              <button
                type="button"
                className="barter-action-btn primary"
                onClick={() => handleRequestSkill(item)}
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