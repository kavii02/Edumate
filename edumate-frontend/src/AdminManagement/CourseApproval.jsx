import React, { useState } from 'react'
import '../index.css'

const courseApprovals = [
  {
    id: 1,
    course: 'Advanced Python for Data Science',
    tutor: 'Dr. Arjuna Perera',
    submitted: 'Oct 26, 2023, 11:30 AM',
    status: 'Pending Approval',
    category: 'Data Science',
    duration: '8 weeks',
    level: 'Advanced',
    language: 'English',
    seats: 'Unlimited',
    description:
      'A hands-on deep dive into advanced Python tools for data analysis, machine learning, visualization, and model deployment.',
    curriculum: [
      'NumPy & Pandas',
      'Data Visualization',
      'Machine Learning Pipelines',
      'Model Deployment'
    ]
  },
  {
    id: 2,
    course: 'SQL Database Design Fundamental',
    tutor: 'Ms. Dilani Silva',
    submitted: 'Oct 25, 2023, 09:15 AM',
    status: 'Pending Approval',
    category: 'Database Engineering',
    duration: '6 weeks',
    level: 'Beginner',
    language: 'English',
    seats: 'Unlimited',
    description:
      'Learn how to design relational databases from scratch, normalize schemas, and write efficient SQL queries for real-world applications.',
    curriculum: [
      'Entity Relationship Modeling',
      'Normalization',
      'Joins & Subqueries',
      'Indexing Strategies'
    ]
  },
  {
    id: 3,
    course: 'Full Stack Web Development (MERN)',
    tutor: 'Mr. Deman Silva',
    submitted: 'Oct 24, 2023, 04:45 PM',
    status: 'Pending Approval',
    category: 'Web Development',
    duration: '10 weeks',
    level: 'Intermediate',
    language: 'English',
    seats: 'Unlimited',
    description:
      'Build modern web applications using MongoDB, Express, React, and Node.js with full stack best practices and deployment workflows.',
    curriculum: [
      'React Fundamentals',
      'API Development',
      'State Management',
      'Deployment'
    ]
  }
]

export default function CourseApproval() {
  const [selectedCourse, setSelectedCourse] = useState(null)

  return (
    <section className="course-approval-section">
      <div className="course-approval-header">
        <div>
          <p className="course-approval-subtitle">Courses Pending Review</p>
        </div>
      </div>

      {selectedCourse ? (
        <div className="course-detail-view">
          <div className="course-detail-header">
            <div>
              <p className="course-approval-subtitle">Course Detail</p>
              <h2>{selectedCourse.course}</h2>
              <p className="profile-page-note">
                Submitted by {selectedCourse.tutor} on {selectedCourse.submitted}
              </p>
            </div>
            <button type="button" className="profile-back-button" onClick={() => setSelectedCourse(null)}>
              Back to List
            </button>
          </div>

          <div className="course-detail-grid">
            <div className="course-detail-card neon-blink">
              <h3>Overview</h3>
              <p>{selectedCourse.description}</p>
              <div className="course-detail-list">
                <div>
                  <span>Category:</span> {selectedCourse.category}
                </div>
                <div>
                  <span>Level:</span> {selectedCourse.level}
                </div>
                <div>
                  <span>Duration:</span> {selectedCourse.duration}
                </div>
                <div>
                  <span>Language:</span> {selectedCourse.language}
                </div>
                <div>
                  <span>Seats:</span> {selectedCourse.seats}
                </div>
              </div>
            </div>

            <div className="course-detail-card neon-blink">
              <h3>Curriculum Breakdown</h3>
              <ul className="course-curriculum-list">
                {selectedCourse.curriculum.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
              <div className="course-detail-actions">
                <button type="button" className="course-action-button">
                  Approve Course
                </button>
                <button type="button" className="course-action-button reject">
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
                {courseApprovals.map((item) => (
                  <tr key={item.id}>
                    <td>{item.course}</td>
                    <td>{item.tutor}</td>
                    <td>{item.submitted}</td>
                    <td>
                      <span className="course-status-pill">{item.status}</span>
                    </td>
                    <td className="course-actions-cell">
                      <button
                        type="button"
                        className="course-view-button"
                        onClick={() => setSelectedCourse(item)}
                      >
                        View Details
                      </button>
                      <button type="button" className="course-action-button">
                        Approve / Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="course-approval-footer">
            <div className="course-pagination">« 1 2 3 »</div>
            <div className="course-pending-count">Total Pending: 7</div>
          </div>
        </div>
      )}
    </section>
  )
}
