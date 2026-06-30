import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Video, Download, Eye, X, Loader2 } from 'lucide-react'
import PageBackBar from './PageBackBar'
import { STUDENT_ROUTES } from './studentRoutes'
import './Student.css'

const CONFUSION_LEVELS = ['Understood', 'Partially Understood', 'Confused']

const typeIcon = (type) => {
  if (type === 'video') return <Video size={16} className="text-purple-400" />
  if (type === 'pdf') return <FileText size={16} className="text-rose-400" />
  return <FileText size={16} className="text-cyan-400" />
}

const levelStyles = {
  beginner: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  intermediate: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  expert: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
}

export default function ClassroomsPage({
  courses,
  selectedClassroomCourse,
  setSelectedClassroomCourse,
  confusionFeedbacks,
  handleConfusionLevelSubmit,
  onDownloadResource,
  onViewResource,
  quizHistory,
  isQuizCompleted,
  getQuizForCourse,
  onStartClassroomQuiz,
  onViewQuizProgress,
  onBack,
  backLabel = 'My Courses'
}) {
  const [previewResource, setPreviewResource] = useState(null)
  const [materials, setMaterials] = useState([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)

  const selectedCourse = courses.find((c) => String(c.id) === String(selectedClassroomCourse) || String(c.course_id) === String(selectedClassroomCourse)) || courses[0]

  useEffect(() => {
    if (!selectedCourse) return
    const cid = selectedCourse.course_id || selectedCourse.id
    if (!cid || isNaN(Number(cid))) { setMaterials([]); return }

    setLoadingMaterials(true)
    fetch(`http://localhost:5000/api/materials/course/${cid}`)
      .then((res) => res.json())
      .then((data) => { if (data.success) setMaterials(data.materials || []) })
      .catch(() => setMaterials([]))
      .finally(() => setLoadingMaterials(false))
  }, [selectedCourse?.course_id, selectedCourse?.id])

  if (!selectedCourse) {
    return <div className="text-center py-12 text-slate-400">No courses available.</div>
  }

  const currentFeedback = confusionFeedbacks?.[String(selectedCourse.id)] || ''
  const courseQuiz = getQuizForCourse?.(selectedCourse.id || selectedCourse.course_id)
  const quizId = courseQuiz?.quiz_id || courseQuiz?.id
  const quizResult = quizHistory?.find((entry) => String(entry.quiz_id) === String(quizId) || String(entry.quizId) === String(quizId))
  const quizDone = quizId ? isQuizCompleted?.(quizId) : false
  const quizTitle = courseQuiz?.quiz_title || courseQuiz?.title || ''
  const quizQCount = courseQuiz?.total_questions ?? courseQuiz?.questions?.length ?? 0
  const quizDuration = courseQuiz?.duration || ''

  const handleDownload = (resource) => {
    if (onDownloadResource) {
      onDownloadResource(resource, selectedCourse)
    } else {
      const link = document.createElement('a')
      link.href = resource.url || '#'
      link.download = resource.title || resource.name || 'material'
      link.click()
    }
  }

  const handleView = (resource) => {
    setPreviewResource(resource)
    onViewResource?.(resource, selectedCourse)
  }

  const resourceName = (m) => m.title || m.name || 'Untitled'
  const resourceType = (m) => m.type || m.material_type || 'doc'
  const resourceSize = (m) => m.size || m.file_size || ''

  return (
    <div className="space-y-6">
      {onBack && <PageBackBar label={backLabel} onBack={onBack} />}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{selectedCourse.title}</h2>
          <p className="text-sm text-slate-400 max-w-2xl">{selectedCourse.description}</p>
          <Link
            to={`${STUDENT_ROUTES.courseMaterials}?course=${selectedCourse.course_id || selectedCourse.id}`}
            className="inline-block mt-2 text-sm text-cyan-400 hover:underline"
          >
            Open Learning Materials →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {courses.map((course) => (
            <button
              key={course.course_id || course.id}
              type="button"
              onClick={() => setSelectedClassroomCourse(String(course.course_id || course.id))}
              className={`rounded-2xl px-3 py-2 text-xs font-semibold ${String(selectedClassroomCourse) === String(course.course_id || course.id) ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'}`}
            >
              {course.title?.split(' ').slice(0, 2).join(' ') || `Course ${course.course_id || course.id}`}
            </button>
          ))}
        </div>
      </div>

      {/* Classroom Quiz */}
      <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
        <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-2">Classroom Quiz</h3>
        {courseQuiz ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-white">{quizTitle}</p>
              <p className="text-sm text-slate-400 mt-1">{quizQCount > 0 ? `${quizQCount} questions` : ''}{quizDuration ? ` • ${quizDuration}` : ''}</p>
              {quizDone && quizResult && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Your score: <strong className="text-white">{quizResult.percentage}%</strong></span>
                  {quizResult.level && (
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${levelStyles[quizResult.level] || levelStyles.intermediate}`}>
                      {quizResult.level}
                    </span>
                  )}
                </div>
              )}
            </div>
            {quizDone ? (
              <button type="button" onClick={onViewQuizProgress} className="shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold hover:opacity-95 transition-opacity">
                View Quiz Progress
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStartClassroomQuiz?.(courseQuiz)}
                disabled={!selectedCourse.enrolled}
                className="shrink-0 px-5 py-3 rounded-2xl bg-cyan-500 text-slate-950 text-sm font-bold hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {selectedCourse.enrolled ? 'Start Quiz' : 'Enroll in course first'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No quiz assigned for this course yet.</p>
        )}
      </div>

      {/* Lesson Understanding Feedback */}
      <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
        <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-2">Lesson Understanding Feedback</h3>
        <p className="text-sm text-slate-400 mb-4">How well did you understand the latest lesson in {selectedCourse.title}?</p>
        <div className="flex flex-wrap gap-3">
          {CONFUSION_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleConfusionLevelSubmit?.(String(selectedCourse.id), level)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${currentFeedback === level
                  ? level === 'Understood'
                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                    : level === 'Partially Understood'
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                      : 'bg-rose-500 text-white ring-2 ring-rose-400'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-cyan-500/30'
                }`}
            >
              {level}
            </button>
          ))}
        </div>
        {currentFeedback && (
          <p className="text-xs text-slate-500 mt-3">Current feedback: <span className="text-cyan-400 font-semibold">{currentFeedback}</span></p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
          <div className="mb-5">
            <span className="text-xs text-cyan-400 uppercase tracking-[0.3em] font-semibold">Course Materials</span>
            <h3 className="text-xl font-bold text-white mt-3">{selectedCourse.progress ?? 0}% complete</h3>
          </div>

          {!selectedCourse.enrolled ? (
            <div className="rounded-3xl bg-slate-900/80 p-6 border border-red-500/20 text-center">
              <h4 className="text-lg font-bold text-red-400">Enrollment Required</h4>
              <p className="text-slate-400 mt-2">Please enroll in this course to view or download learning materials.</p>
            </div>
          ) : loadingMaterials ? (
            <div className="flex items-center gap-3 text-slate-400 py-8 justify-center">
              <Loader2 className="animate-spin w-5 h-5" />
              <span className="text-sm">Loading materials...</span>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No materials uploaded yet for this course.</p>
              <p className="text-slate-600 text-xs mt-1">Your tutor will upload study materials here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <div key={material.material_id} className="rounded-3xl bg-slate-900/80 p-4 border border-slate-850">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{typeIcon(resourceType(material))}</div>
                      <div>
                        <p className="text-sm text-slate-200 font-semibold">{resourceName(material)}</p>
                        <p className="text-xs text-slate-500 capitalize">{resourceType(material)}{resourceSize(material) ? ` • ${resourceSize(material)}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleView(material)} className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                        <Eye size={12} /> View
                      </button>
                      {resourceType(material) !== 'video' && (
                        <button type="button" onClick={() => handleDownload(material)} className="flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-cyan-100 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                          <Download size={12} /> Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">Course Overview</h3>
          <div className="space-y-3 text-sm text-slate-300">
            <p><strong>Tutor:</strong> {selectedCourse.tutor || selectedCourse.instructor || 'Not assigned'}</p>
            <p><strong>Enrollment:</strong> {selectedCourse.enrolled ? 'Active' : 'Not enrolled'}</p>
            <p><strong>Progress:</strong> {selectedCourse.progress ?? 0}%</p>
            <p><strong>Materials:</strong> {materials.length} items</p>
          </div>
        </aside>
      </div>

      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#07101f] border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">{resourceType(previewResource)}</p>
                <h3 className="text-xl font-bold text-white mt-1">{resourceName(previewResource)}</h3>
              </div>
              <button type="button" onClick={() => setPreviewResource(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            {resourceType(previewResource) === 'video' ? (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 aspect-video flex items-center justify-center">
                <div className="text-center p-6">
                  <Video size={48} className="text-purple-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-300">Video lesson: {resourceName(previewResource)}</p>
                  {resourceSize(previewResource) && <p className="text-xs text-slate-500 mt-2">Duration: {resourceSize(previewResource)}</p>}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-sm text-slate-300 space-y-2">
                <p className="font-semibold text-white">Document Preview</p>
                <p>File: <strong>{resourceName(previewResource)}</strong></p>
                {resourceSize(previewResource) && <p className="text-slate-500">Size: {resourceSize(previewResource)}</p>}
                {previewResource.description && <p className="text-slate-400 mt-2">{previewResource.description}</p>}
              </div>
            )}
            <div className="mt-4 flex gap-3">
              {resourceType(previewResource) !== 'video' && (
                <button type="button" onClick={() => { handleDownload(previewResource); setPreviewResource(null) }} className="flex-1 py-3 rounded-2xl bg-cyan-500 text-slate-950 text-sm font-bold">Download File</button>
              )}
              <button type="button" onClick={() => setPreviewResource(null)} className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}