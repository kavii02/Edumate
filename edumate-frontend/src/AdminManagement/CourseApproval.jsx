import React, { useEffect, useState } from 'react'
import '../index.css'

const API_BASE_URL = 'http://localhost:5000'

export default function CourseApproval() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCourses = async () => {
    try {
      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/api/admin/courses`)
      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to load courses')
        return
      }

      setCourses(data)
    } catch (error) {
      console.error('Course loading error:', error)
      alert('Backend connection failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const updateCourseStatus = async (courseId, action) => {
    const confirmText =
      action === 'approve'
        ? 'Are you sure you want to approve this course?'
        : 'Are you sure you want to reject this course?'

    if (!window.confirm(confirmText)) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/courses/${courseId}/${action}`,
        {
          method: 'PUT'
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || `Failed to ${action} course`)
        return
      }

      alert(data.message || `Course ${action}d successfully`)

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId
            ? {
                ...course,
                status: action === 'approve' ? 'Approved' : 'Rejected'
              }
            : course
        )
      )

      setSelectedCourse((prev) =>
        prev
          ? {
              ...prev,
              status: action === 'approve' ? 'Approved' : 'Rejected'
            }
          : null
      )
    } catch (error) {
      console.error('Course status update error:', error)
      alert('Server error. Please check backend.')
    }
  }

  const pendingCount = courses.filter((course) => course.status === 'Pending').length

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not available'

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return dateValue
    }

    return date.toLocaleString()
  }

  const getStatusClass = (status) => {
    const value = String(status || 'Pending').toLowerCase()

    if (value === 'approved') return 'approved'
    if (value === 'rejected') return 'rejected'
    return 'pending'
  }

  return (
    <section className="course-approval-section">
      <div className="course-approval-header">
        <div>
          <p className="course-approval-subtitle">Tutor Course Review</p>
          <h2 className="page-title">Course Approval</h2>
          <p className="profile-page-note">
            Review courses submitted by tutors before publishing them to students.
          </p>
        </div>
      </div>

      {selectedCourse ? (
        <div className="course-detail-view">
          <div className="course-detail-header">
            <div>
              <p className="course-approval-subtitle">Course Detail</p>
              <h2>{selectedCourse.course}</h2>
              <p className="profile-page-note">
                Submitted by {selectedCourse.tutor || 'Unknown Tutor'} on{' '}
                {formatDate(selectedCourse.submitted_at || selectedCourse.created_at)}
              </p>
            </div>

            <button
              type="button"
              className="profile-back-button"
              onClick={() => setSelectedCourse(null)}
            >
              Back to List
            </button>
          </div>

          <div className="course-detail-grid">
            <div className="course-detail-card neon-blink">
              <h3>Course Overview</h3>

              <p>
                {selectedCourse.description || 'No course description available.'}
              </p>

              <div className="course-detail-list">
                <div>
                  <span>Course ID:</span> {selectedCourse.id}
                </div>

                <div>
                  <span>Tutor:</span> {selectedCourse.tutor || 'Unknown Tutor'}
                </div>

                <div>
                  <span>Status:</span>{' '}
                  <span className={`course-status-pill ${getStatusClass(selectedCourse.status)}`}>
                    {selectedCourse.status || 'Pending'}
                  </span>
                </div>

                <div>
                  <span>Created At:</span> {formatDate(selectedCourse.created_at)}
                </div>

                <div>
                  <span>Submitted At:</span> {formatDate(selectedCourse.submitted_at)}
                </div>
              </div>
            </div>

            <div className="course-detail-card neon-blink">
              <h3>Admin Review Action</h3>

              <p className="profile-page-note">
                Admin can approve suitable course content or reject inappropriate or incomplete
                course submissions.
              </p>

              <div className="course-detail-actions">
                <button
                  type="button"
                  className="course-action-button"
                  disabled={selectedCourse.status === 'Approved'}
                  onClick={() => updateCourseStatus(selectedCourse.id, 'approve')}
                >
                  Approve Course
                </button>

                <button
                  type="button"
                  className="course-action-button reject"
                  disabled={selectedCourse.status === 'Rejected'}
                  onClick={() => updateCourseStatus(selectedCourse.id, 'reject')}
                >
                  Reject Course
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="course-approval-card neon-card-purple">
          <div className="table-wrapper">
            <table className="course-approval-table">
              <thead>
                <tr>
                  <th>COURSE NAME</th>
                  <th>TUTOR</th>
                  <th>DATE SUBMITTED</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      Loading courses...
                    </td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No courses found.
                    </td>
                  </tr>
                ) : (
                  courses.map((item) => (
                    <tr key={item.id}>
                      <td>{item.course}</td>

                      <td>{item.tutor || 'Unknown Tutor'}</td>

                      <td>{formatDate(item.submitted_at || item.created_at)}</td>

                      <td>
                        <span className={`course-status-pill ${getStatusClass(item.status)}`}>
                          {item.status || 'Pending'}
                        </span>
                      </td>

                      <td className="course-actions-cell">
                        <button
                          type="button"
                          className="course-view-button"
                          onClick={() => setSelectedCourse(item)}
                        >
                          View Details
                        </button>

                        {item.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              className="course-action-button"
                              onClick={() => updateCourseStatus(item.id, 'approve')}
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              className="course-action-button reject"
                              onClick={() => updateCourseStatus(item.id, 'reject')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="course-approval-footer">
            <div className="course-pagination">Showing {courses.length} course records</div>
            <div className="course-pending-count">Total Pending: {pendingCount}</div>
          </div>
        </div>
      )}
    </section>
  )
}