export const LEVEL_ORDER = { beginner: 0, intermediate: 1, expert: 2 }

export function getQuizPerformanceLevel(percentage) {
  if (percentage >= 80) return 'expert'
  if (percentage >= 50) return 'intermediate'
  return 'beginner'
}

/** Per-course level for the current student from quiz results + progress fallback */
export function getStudentCourseLevels(courses, quizHistory) {
  const levels = {}
  courses.filter((c) => c.enrolled).forEach((course) => {
    const quiz = quizHistory.find((h) => h.courseId === course.id)
    if (quiz?.level) {
      levels[course.id] = quiz.level
    } else if (quiz?.percentage != null) {
      levels[course.id] = getQuizPerformanceLevel(quiz.percentage)
    } else if (course.progress < 40) {
      levels[course.id] = 'beginner'
    } else if (course.progress < 75) {
      levels[course.id] = 'intermediate'
    } else {
      levels[course.id] = 'expert'
    }
  })
  return levels
}

/**
 * Only suggest peers who are expert in a course area where the student is beginner/intermediate.
 */
export function getExpertMentorsForStudent(peers, courses, quizHistory) {
  const courseLevels = getStudentCourseLevels(courses, quizHistory)
  return peers.filter((peer) => {
    if (peer.quizLevel !== 'expert') return false
    const studentLevel = courseLevels[peer.field]
    if (!studentLevel) return false
    return LEVEL_ORDER[studentLevel] < LEVEL_ORDER.expert
  })
}

export function buildMentorReason(peer, studentLevel) {
  const topic = peer.expertise
  if (studentLevel === 'beginner') {
    return `Expert in ${topic} — matched because you're building foundations in ${peer.field}.`
  }
  return `Expert in ${topic} — matched to help you reach expert level in ${peer.field}.`
}
