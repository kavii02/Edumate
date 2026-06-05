import React, { useState } from 'react'
import { Plus, Edit3, Trash2, X, Check } from 'lucide-react'

export default function MySkills() {
  const [skills, setSkills] = useState([
    { id: 1, name: 'Python Basics', category: 'Programming', level: 'Intermediate', description: 'Can teach control flow loops, arrays, and algorithmic logic setups.' },
    { id: 2, name: 'HTML Semantic Structure', category: 'Web Development', level: 'Advanced', description: 'Structuring accessible sites for projects.' }
  ])

  // Form input handling states
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('Programming')
  const [formLevel, setFormLevel] = useState('Beginner')
  const [formDesc, setFormDesc] = useState('')

  const handleOpenAdd = () => {
    setFormName('')
    setFormCategory('Programming')
    setFormLevel('Beginner')
    setFormDesc('')
    setIsAdding(true)
    setEditingId(null)
  }

  const handleOpenEdit = (skill) => {
    setEditingId(skill.id)
    setFormName(skill.name)
    setFormCategory(skill.category)
    setFormLevel(skill.level)
    setFormDesc(skill.description)
    setIsAdding(false)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!formName.trim() || !formDesc.trim()) return

    if (editingId) {
      // Handle Edit (Update Operation)
      setSkills(skills.map(s => s.id === editingId ? {
        ...s, name: formName, category: formCategory, level: formLevel, description: formDesc
      } : s))
      setEditingId(null)
    } else {
      // Handle Add (Create Operation)
      const newSkill = {
        id: Date.now(),
        name: formName,
        category: formCategory,
        level: formLevel,
        description: formDesc
      }
      setSkills([...skills, newSkill])
      setIsAdding(false)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this skill entry?')) {
      setSkills(skills.filter(s => s.id !== id))
    }
  }

  return (
    <div className="barter-view-panel">
      <div className="view-panel-header row-layout">
        <div>
          <h2>My Skills (Your CRUD Dashboard)</h2>
          <p>Configure the skill sets you can offer to other students in swap exchange cycles.</p>
        </div>
        {!isAdding && !editingId && (
          <button type="button" className="barter-action-btn accent" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add New Skill</span>
          </button>
        )}
      </div>

      {/* Form Area - Conditional rendering based on state */}
      {(isAdding || editingId) && (
        <div className="barter-form-wrapper glass-card neon-card-purple">
          <h3>{editingId ? 'Edit Skill Information' : 'Add Skill to Profile Portfolio'}</h3>
          <form onSubmit={handleSave} className="barter-crud-form">
            <div className="form-grid-row">
              <label className="field-group">
                <span>Skill Name</span>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Java OOP, Subnetting" required />
              </label>

              <label className="field-group">
                <span>Category</span>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                  <option value="Programming">Programming</option>
                  <option value="Database Engineering">Database Engineering</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Networking">Networking</option>
                </select>
              </label>

              <label className="field-group">
                <span>Proficiency Level</span>
                <select value={formLevel} onChange={(e) => setFormLevel(e.target.value)}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </label>
            </div>

            <label className="field-group textarea-full">
              <span>Short Description</span>
              <textarea rows="3" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Describe what concepts you understand well and can explain clearly..." required></textarea>
            </label>

            <div className="form-actions-row">
              <button type="button" className="barter-action-btn outline" onClick={() => { setIsAdding(false); setEditingId(null); }}>
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button type="submit" className="barter-action-btn primary">
                <Check size={16} />
                <span>{editingId ? 'Update Skill' : 'Save Skill'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Skill List Presentation Table Area */}
      <div className="table-responsive-container" glass-card>
        <table className="barter-display-table">
          <thead>
            <tr>
              <th>SKILL NAME</th>
              <th>CATEGORY</th>
              <th>LEVEL</th>
              <th>DESCRIPTION</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill.id}>
                <td style={{ fontWeight: 600, color: '#f8fafc' }}>{skill.name}</td>
                <td><span className="table-category-pill">{skill.category}</span></td>
                <td><span className={`level-badge ${skill.level.toLowerCase()}`}>{skill.level}</span></td>
                <td className="table-desc-cell">{skill.description}</td>
                <td>
                  <div className="table-actions-cluster">
                    <button type="button" className="icon-action-btn edit-btn" onClick={() => handleOpenEdit(skill)} title="Edit Entry">
                      <Edit3 size={14} />
                    </button>
                    <button type="button" className="icon-action-btn delete-btn" onClick={() => handleDelete(skill.id)} title="Delete Entry">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {skills.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-table-state">No custom skills defined yet. Add one above!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}