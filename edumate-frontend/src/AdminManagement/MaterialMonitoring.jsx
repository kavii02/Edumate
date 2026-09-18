import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import '../index.css'
import { adminFetch, API_BASE_URL } from './adminApi'

export default function MaterialMonitoring({ isSuperAdmin = false }) {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  const loadMaterials = async () => {
    setLoading(true)
    try {
      const response = await adminFetch(`${API_BASE_URL}/api/admin/materials`)
      const data = await response.json()
      if (response.ok) setMaterials(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMaterials() }, [])

  const removeMaterial = async (material) => {
    if (!window.confirm(`Remove ${material.title}?`)) return
    const response = await adminFetch(`${API_BASE_URL}/api/admin/materials/${material.id}`, { method: 'DELETE' })
    if (response.ok) setMaterials((current) => current.filter((item) => item.id !== material.id))
  }

  return (
    <section className="user-management-page">
      <div className="user-management-header">
        <div>
          <h1 className="page-title">Learning Materials</h1>
          <p className="profile-page-note">Monitor materials uploaded to EduMate courses.</p>
        </div>
      </div>
      <div className="user-table-card neon-blink">
        <div className="table-wrapper">
          <table className="user-table">
            <thead><tr><th>TITLE</th><th>COURSE</th><th>TUTOR</th><th>TYPE</th><th>SOURCE</th><th>UPLOADED</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7" className="empty-state">Loading materials...</td></tr> : materials.length === 0 ? <tr><td colSpan="7" className="empty-state">No learning materials found.</td></tr> : materials.map((material) => (
                <tr key={material.id}>
                  <td>{material.title || 'Untitled'}</td>
                  <td>{material.course || 'Unknown course'}</td>
                  <td>{material.tutor || 'Unknown tutor'}</td>
                  <td>{material.material_type || '—'}</td>
                  <td>{material.source || '—'}</td>
                  <td>{material.uploaded_at ? new Date(material.uploaded_at).toLocaleString() : '—'}</td>
                  <td>{isSuperAdmin && material.source === 'Uploaded material' && <button type="button" className="action-button delete-button" onClick={() => removeMaterial(material)}><Trash2 size={14} /> Remove</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
