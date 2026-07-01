import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, X, Check } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000'

export default function MySkills() {
  const studentId = parseInt(localStorage.getItem('edumate_student_id') || '1', 10)

  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('Programming')
  const [formLevel, setFormLevel] = useState('Beginner')
  const [formDesc, setFormDesc] = useState('')

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/skills/student/${studentId}`)
      const data = await res.json()
      if (res.ok) setSkills(data)
    } catch (err) {
      console.error('Failed to load skills:', err)
    } finally {
      setLoading(false)
    }
  }

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

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formName.trim() || !formDesc.trim()) return

    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch(`${API_BASE_URL}/api/skills/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            category: formCategory,
            level: formLevel,
            description: formDesc
          })
        })
        if (res.ok) {
          setSkills(skills.map(s => s.id === editingId
            ? { ...s, name: formName, category: formCategory, level: formLevel, description: formDesc }
            : s
          ))
          setEditingId(null)
        } else {
          alert('Failed to update skill.')
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/skills/student/${studentId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            category: formCategory,
            level: formLevel,
            description: formDesc
          })
        })
        const data = await res.json()
        if (res.ok) {
          setSkills([...skills, data])
          setIsAdding(false)
        } else {
          alert(data.error || 'Failed to add skill.')
        }
      }
    } catch (err) {
      console.error('Save error:', err)
      alert('Server error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this skill?')) return

    try {
      const res = await fetch(`${API_BASE_URL}/api/skills/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setSkills(skills.filter(s => s.id !== id))
      } else {
        alert('Failed to delete skill.')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Server error. Please try again.')
    }
  }

  return (
    <div className="barter-view-panel">
      <div className="view-panel-header row-layout">
        <div>
          <h2>My Skills</h2>
          <p>Manage the skills you offer to your peers.</p>
        </div>
        {!isAdding && !editingId && (
          <button type="button" className="barter-action-btn accent" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add New Skill</span>
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {(isAdding || editingId) && (
        <div className="barter-form-wrapper glass-card neon-card-purple">
          <h3>{editingId ? 'Edit Skill Information' : 'Add Skill to Profile Portfolio'}</h3>
          <form onSubmit={handleSave} className="barter-crud-form">
            <div className="form-grid-row">
              <label className="field-group">
                <span>Skill Name</span>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Java OOP, Subnetting"
                  required
                />
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
                </select>
              </label>
            </div>

            <label className="field-group textarea-full">
              <span>Short Description</span>
              <textarea
                rows="3"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Describe what concepts you understand well and can explain clearly..."
                required
              />
            </label>

            <div className="form-actions-row">
              <button
                type="button"
                className="barter-action-btn outline"
                onClick={() => { setIsAdding(false); setEditingId(null) }}
                disabled={saving}
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button type="submit" className="barter-action-btn primary" disabled={saving}>
                <Check size={16} />
                <span>{saving ? 'Saving…' : editingId ? 'Update Skill' : 'Save Skill'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Skill List Table */}
      <div className="table-responsive-container">
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
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-table-state">Loading your skills…</td>
              </tr>
            ) : skills.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-table-state">No skills added yet. Add one above!</td>
              </tr>
            ) : (
              skills.map((skill) => (
                <tr key={skill.id}>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{skill.name}</td>
                  <td><span className="table-category-pill">{skill.category}</span></td>
                  <td><span className={`level-badge ${(skill.level || '').toLowerCase()}`}>{skill.level}</span></td>
                  <td className="table-desc-cell">{skill.description}</td>
                  <td>
                    <div className="table-actions-cluster">
                      <button
                        type="button"
                        className="icon-action-btn edit-btn"
                        onClick={() => handleOpenEdit(skill)}
                        title="Edit Entry"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-action-btn delete-btn"
                        onClick={() => handleDelete(skill.id)}
                        title="Delete Entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}