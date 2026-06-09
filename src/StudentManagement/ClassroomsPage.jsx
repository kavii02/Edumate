import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Video, Download, Eye, X } from 'lucide-react'
import PageBackBar from './PageBackBar'
import { STUDENT_ROUTES } from './studentRoutes'
import './Student.css'

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
  const selectedCourse = courses.find((course) => course.id === selectedClassroomCourse) || courses[0]
  const resources = courseResources[selectedCourse.id] || []
  const currentFeedback = confusionFeedbacks[selectedCourse.id] || ''
  const courseQuiz = getQuizForCourse?.(selectedCourse.id)
  const quizResult = quizHistory?.find((entry) => entry.quizId === courseQuiz?.id)
  const quizDone = courseQuiz ? isQuizCompleted?.(courseQuiz.id) : false

  const handleDownload = (resource) => {
    onDownloadResource(resource, selectedCourse)
  }

  const handleView = (resource) => {
    setPreviewResource(resource)
    onViewResource?.(resource, selectedCourse)
  }

  return (
    <div className="space-y-6">
      {onBack && <PageBackBar label={backLabel} onBack={onBack} />}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{selectedCourse.title}</h2>
          <p className="text-sm text-slate-400 max-w-2xl">{selectedCourse.description}</p>
          <Link to={`${STUDENT_ROUTES.courseMaterials}?course=${selectedCourse.id}`} className="inline-block mt-2 text-sm text-cyan-400 hover:underline">
            Open Learning Materials →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => setSelectedClassroomCourse(course.id)}
              className={`rounded-2xl px-3 py-2 text-xs font-semibold ${selectedClassroomCourse === course.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'}`}
            >
              {course.id}
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
              <p className="text-base font-semibold text-white">{courseQuiz.title}</p>
              <p className="text-sm text-slate-400 mt-1">{courseQuiz.questions.length} questions • {courseQuiz.duration}</p>
              {quizDone && quizResult && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Your score: <strong className="text-white">{quizResult.percentage}%</strong></span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${levelStyles[quizResult.level] || levelStyles.intermediate}`}>
                    {quizResult.level}
                  </span>
                </div>
              )}
            </div>
            {quizDone ? (
              <button
                type="button"
                onClick={onViewQuizProgress}
                className="shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold hover:opacity-95 transition-opacity"
              >
                View Quiz Progress
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStartClassroomQuiz(courseQuiz)}
                disabled={!selectedCourse.enrolled}
                className="shrink-0 px-5 py-3 rounded-2xl bg-cyan-500 text-slate-950 text-sm font-bold hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {selectedCourse.enrolled ? 'Enroll & Take Quiz' : 'Enroll in course first'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No quiz assigned for this classroom yet. Check back when your tutor publishes one.</p>
        )}
      </div>

      {/* Lesson Understanding Feedback */}
      <div className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl">
        <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-2">Lesson Understanding Feedback</h3>
        <p className="text-sm text-slate-400 mb-4">How well did you understand the latest lesson in {selectedCourse.id}?</p>
        <div className="flex flex-wrap gap-3">
          {CONFUSION_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => handleConfusionLevelSubmit(selectedCourse.id, level)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                currentFeedback === level
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
        <div className="lg:col-span-2 rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl shadow-slate-950/15">
          <div className="mb-5">
            <span className="text-xs text-cyan-400 uppercase tracking-[0.3em] font-semibold">Course Progress</span>
            <h3 className="text-xl font-bold text-white mt-3">{selectedCourse.progress}% complete</h3>
          </div>
          <div className="space-y-4">
            {!selectedCourse.enrolled ? (
              <div className="rounded-3xl bg-slate-900/80 p-6 border border-red-500/20 text-center">
                <h4 className="text-lg font-bold text-red-400">
                  Enrollment Required
                </h4>
                <p className="text-slate-400 mt-2">
                  Please enroll in this course to view or download learning materials.
                </p>
              </div>
            ) : (
              resources.map((resource) => (
              <div key={resource.id} className="rounded-3xl bg-slate-900/80 p-4 border border-slate-850">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{typeIcon(resource.type)}</div>
                    <div>
                      <p className="text-sm text-slate-200 font-semibold">{resource.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{resource.type} • {resource.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleView(resource)}
                      className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700"
                    >
                      <Eye size={12} /> View
                    </button>
                    {resource.type !== 'video' && (
                      <button
                        type="button"
                        onClick={() => handleDownload(resource)}
                        className="flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-cyan-100 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                      >
                        <Download size={12} /> Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
              )
            ))}
          </div>
        </div>
        <aside className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl shadow-slate-950/10">
          <h3 className="text-sm uppercase tracking-[0.3em] text-slate-400 font-bold mb-4">Course Overview</h3>
          <div className="space-y-3 text-sm text-slate-300">
            <p><strong>Tutor:</strong> {selectedCourse.tutor}</p>
            <p><strong>Enrollment:</strong> {selectedCourse.enrolled ? 'Active' : 'Not enrolled'}</p>
            <p><strong>Current module:</strong> {selectedCourse.progress < 50 ? 'Basics & Practice' : 'Advanced Concepts'}</p>
            <p><strong>Next milestone:</strong> {selectedCourse.progress < 100 ? 'Complete next quiz' : 'Course masteries unlocked'}</p>
            <p><strong>Resources:</strong> {resources.length} items ({resources.filter((r) => r.type === 'video').length} videos)</p>
          </div>
        </aside>
      </div>

      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#07101f] border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">{previewResource.type}</p>
                <h3 className="text-xl font-bold text-white mt-1">{previewResource.name}</h3>
              </div>
              <button type="button" onClick={() => setPreviewResource(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            {previewResource.type === 'video' ? (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 aspect-video flex items-center justify-center">
                <div className="text-center p-6">
                  <Video size={48} className="text-purple-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-300">Video lesson preview</p>
                  <p className="text-xs text-slate-500 mt-2">Duration: {previewResource.size}</p>
                  <p className="text-xs text-slate-500 mt-1">Hosted by {selectedCourse.tutor}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-sm text-slate-300 space-y-2">
                <p className="font-semibold text-white">Document Preview</p>
                <p>This is a preview of <strong>{previewResource.name}</strong> uploaded for {selectedCourse.id}.</p>
                <p className="text-slate-500">File size: {previewResource.size}</p>
              </div>
            )}
            <div className="mt-4 flex gap-3">
              {previewResource.type !== 'video' && (
                <button
                  type="button"
                  onClick={() => { handleDownload(previewResource); setPreviewResource(null) }}
                  className="flex-1 py-3 rounded-2xl bg-cyan-500 text-slate-950 text-sm font-bold"
                >
                  Download File
                </button>
              )}
              <button
                type="button"
                onClick={() => setPreviewResource(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-200 text-sm font-bold border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
