import React from 'react'
import { STUDENT_ROUTES } from './studentRoutes'
import './Student.css'

export default function CourseLibrary({ courses, handleEnrollCourse, setSelectedClassroomCourse, navigate }) {
  const enrolledCount = courses.filter((c) => c.enrolled).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Course Library</h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Browse subjects, enroll in classes, and open classrooms for materials and lesson feedback.
          </p>
        </div>
        {enrolledCount > 0 && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate(STUDENT_ROUTES.quizzes)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300">
              Quizzes
            </button>
            <button type="button" onClick={() => navigate(STUDENT_ROUTES.studyPlanner)} className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300">
              Study Planner
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((course) => (
          <div key={course.id} className="rounded-3xl bg-slate-950/70 border border-slate-900 p-6 shadow-xl shadow-slate-950/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold bg-slate-900/70 px-3 py-1 rounded-full">{course.id}</span>
              <span className="text-xs text-slate-400">{course.tutor}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">{course.description}</p>
            <div className="flex items-center justify-between gap-3">
              <div
                className={`px-4 py-2 rounded-2xl text-sm font-semibold text-center ${
                  course.enrolled
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {course.enrolled ? 'Enrolled' : 'Not Enrolled'}
              </div>
              {!course.enrolled && (
                  <p className="text-xs text-red-400 mt-2 w-full">
                    Enroll in this course to access materials and downloads.
                  </p>
                )}
              <button
                type="button"
              disabled={!course.enrolled}
              onClick={() => {
                if (course.enrolled) {
                  setSelectedClassroomCourse(course.id)
                  navigate(STUDENT_ROUTES.course(course.id))
                }
              }}
              className={`px-4 py-2 rounded-2xl border transition ${
                course.enrolled
                  ? 'border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/30'
                  : 'border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              {course.enrolled ? 'View Course' : 'Access Restricted'}
            </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
