import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FileText, Video, Download, Eye, Loader2 } from 'lucide-react'
import { STUDENT_ROUTES } from '../studentRoutes'

const typeIcon = (type) => {
  if (type === 'video') return <Video size={16} className="text-purple-400" />
  if (type === 'pdf') return <FileText size={16} className="text-rose-400" />
  return <FileText size={16} className="text-cyan-400" />
}

export default function CourseMaterialsPage({ courses, onDownloadResource }) {
  const [searchParams] = useSearchParams()
  const rawCourseId = searchParams.get('course')
  const course = courses.find((c) => String(c.course_id) === String(rawCourseId) || String(c.id) === String(rawCourseId))
    || courses.find((c) => c.enrolled)
    || courses[0]

  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!course) return
    const cid = course.course_id || course.id
    if (!cid || isNaN(Number(cid))) { setMaterials([]); return }

    setLoading(true)
    fetch(`http://localhost:5000/api/materials/course/${cid}`)
      .then((res) => res.json())
      .then((data) => { if (data.success) setMaterials(data.materials || []) })
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false))
  }, [course?.course_id, course?.id])

  const resourceName = (m) => m.title || m.name || 'Untitled'
  const resourceType = (m) => m.type || m.material_type || 'doc'
  const resourceSize = (m) => m.size || m.file_size || ''

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Learning Materials</h2>
        <p className="text-sm text-slate-400">PDFs, videos, and tutorials for {course?.title}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {courses.filter((c) => c.enrolled).map((c) => {
          const cid = c.course_id || c.id
          const isActive = String(course?.course_id || course?.id) === String(cid)
          return (
            <Link
              key={cid}
              to={`${STUDENT_ROUTES.courseMaterials}?course=${cid}`}
              className={`px-3 py-2 rounded-xl text-xs font-semibold ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300'}`}
            >
              {c.title?.split(' ').slice(0, 2).join(' ') || `Course ${cid}`}
            </Link>
          )
        })}
      </div>

      {!course?.enrolled ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm">Enroll in a course to access its materials.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
          <Loader2 className="animate-spin w-5 h-5" />
          <span className="text-sm">Loading materials...</span>
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm">No materials uploaded yet for this course.</p>
          <p className="text-slate-500 text-xs mt-1">Your tutor will upload study materials here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((material) => (
            <div key={material.material_id} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900">
              <div className="flex items-start gap-3">
                {typeIcon(resourceType(material))}
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{resourceName(material)}</p>
                  <p className="text-xs text-slate-500 capitalize mt-1">
                    {resourceType(material)}{resourceSize(material) ? ` • ${resourceSize(material)}` : ''}
                  </p>
                  {material.description && <p className="text-xs text-slate-400 mt-1">{material.description}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700">
                  <Eye size={12} /> View
                </button>
                {resourceType(material) !== 'video' && (
                  <button
                    type="button"
                    onClick={() => onDownloadResource?.(material, course)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/20"
                  >
                    <Download size={12} /> Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to={STUDENT_ROUTES.course(course?.course_id || course?.id)} className="text-sm text-cyan-400 hover:underline">
        ← Back to course details
      </Link>
    </div>
  )
}