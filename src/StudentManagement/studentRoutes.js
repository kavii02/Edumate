export const STUDENT_ROUTES = {
  dashboard: '/dashboard',
  courses: '/courses',
  course: (id) => `/course/${id}`,
  courseMaterials: '/course-materials',
  quizzes: '/quizzes',
  quiz: (id) => `/quiz/${id}`,
  result: (id) => `/result/${id}`,
  performance: '/performance',
  aiFeedback: '/ai-feedback',
  studyPlanner: '/study-planner',
  rewards: '/rewards',
  leaderboard: '/leaderboard',
  profile: '/profile',
  attendance: '/attendance',
  notifications: '/notifications',
  community: '/community',
  settings: '/settings'
}

export const routeTitles = {
  '/dashboard': 'Dashboard',
  '/courses': 'My Courses',
  '/quizzes': 'Quiz Center',
  '/performance': 'Performance',
  '/ai-feedback': 'AI Feedback',
  '/study-planner': 'Study Planner',
  '/rewards': 'Rewards & Badges',
  '/leaderboard': 'Leaderboard',
  '/profile': 'Profile',
  '/attendance': 'Attendance',
  '/notifications': 'Notifications',
  '/community': 'Community',
  '/settings': 'Settings',
  '/course-materials': 'Learning Materials'
}
