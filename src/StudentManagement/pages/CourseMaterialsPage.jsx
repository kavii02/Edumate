import { useSearchParams, Link } from 'react-router-dom'
import { FileText, Video, Download, Eye } from 'lucide-react'
import { STUDENT_ROUTES } from '../studentRoutes'

const courseResources = {
  'ICT-101': [
    { id: 'r1', name: 'Python programming notes.pdf', type: 'pdf', size: '1.2 MB' },
    { id: 'r2', name: 'Array and loop cheat sheet', type: 'doc', size: '840 KB' },
    { id: 'r3', name: 'Week 5 - OOP Tutorial (Video)', type: 'video', size: '24 min' }
  ],
  'ICT-102': [
    { id: 'r4', name: 'Normalization guide.docx', type: 'doc', size: '960 KB' },
    { id: 'r5', name: 'ER diagram examples.pdf', type: 'pdf', size: '2.1 MB' },
    { id: 'r6', name: 'SQL Query Drills (Video)', type: 'video', size: '18 min' }
  ],
  'ICT-103': [
    { id: 'r7', name: 'OSI model review slides', type: 'pdf', size: '3.4 MB' },
    { id: 'r8', name: 'Subnetting exercises.pdf', type: 'pdf', size: '1.5 MB' },
    { id: 'r9', name: 'Network Security Overview (Video)', type: 'video', size: '32 min' }
  ],
  'ICT-104': [
    { id: 'r10', name: 'UML best practices', type: 'doc', size: '720 KB' },
    { id: 'r11', name: 'Agile sprint planning template', type: 'pdf', size: '540 KB' },
    { id: 'r12', name: 'SDLC Walkthrough (Video)', type: 'video', size: '28 min' }
  ]
}

const typeIcon = (type) => {
  if (type === 'video') return <Video size={16} className="text-purple-400" />
  return <FileText size={16} className="text-cyan-400" />
}

export default function CourseMaterialsPage({ courses, onDownloadResource }) {
  const [searchParams] = useSearchParams()
  const courseId = searchParams.get('course') || courses.find((c) => c.enrolled)?.id || 'ICT-101'
  const course = courses.find((c) => c.id === courseId) || courses[0]
  const resources = courseResources[courseId] || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Learning Materials</h2>
        <p className="text-sm text-slate-400">PDFs, videos, and tutorials for {course?.title}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {courses.filter((c) => c.enrolled).map((c) => (
          <Link
            key={c.id}
            to={`${STUDENT_ROUTES.courseMaterials}?course=${c.id}`}
            className={`px-3 py-2 rounded-xl text-xs font-semibold ${c.id === courseId ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300'}`}
          >
            {c.id}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <div key={resource.id} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-900">
            <div className="flex items-start gap-3">
              {typeIcon(resource.type)}
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{resource.name}</p>
                <p className="text-xs text-slate-500 capitalize mt-1">{resource.type} • {resource.size}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700">
                <Eye size={12} /> View
              </button>
              {resource.type !== 'video' && (
                <button
                  type="button"
                  onClick={() => onDownloadResource(resource, course)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/20"
                >
                  <Download size={12} /> Download
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Link to={STUDENT_ROUTES.course(courseId)} className="text-sm text-cyan-400 hover:underline">
        ← Back to course details
      </Link>
    </div>
  )
}
