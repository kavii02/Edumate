import './Student.css'
import { useState, useMemo, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, NavLink, useParams } from 'react-router-dom'
import {
  LayoutGrid,
  BookOpen,
  TrendingUp,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  User,
  Users,
  ClipboardList,
  Award,
  Sparkles
} from 'lucide-react'
import { STUDENT_ROUTES, routeTitles } from './studentRoutes'
import StudentOverview from './StudentOverview'
import CourseLibrary from './CourseLibrary'
import ClassroomsPage from './ClassroomsPage'
import StudyPlanner from './StudyPlanner'
import StudentPeerLearning from './StudentPeerLearning'
import Notifications from './Notifications'
import SettingsPage from './Settings'
import AttendancePage from './AttendancePage'
import CommunityPage from './CommunityPage'
import QuizListPage from './pages/QuizListPage'
import QuizAttemptPage from './pages/QuizAttemptPage'
import QuizResultPage from './pages/QuizResultPage'
import PerformancePage from './pages/PerformancePage'
import AIFeedbackPage from './pages/AIFeedbackPage'
import RewardsPage from './pages/RewardsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import CourseMaterialsPage from './pages/CourseMaterialsPage'
import { getStudentCourseLevels, getExpertMentorsForStudent } from './utils/peerMatching'

const navItems = [
  { path: STUDENT_ROUTES.dashboard, name: 'Dashboard', icon: <LayoutGrid size={18} /> },
  { path: STUDENT_ROUTES.courses, name: 'My Courses', icon: <BookOpen size={18} /> },
  { path: STUDENT_ROUTES.quizzes, name: 'Quiz Center', icon: <ClipboardList size={18} /> },
  { path: STUDENT_ROUTES.performance, name: 'Performance', icon: <TrendingUp size={18} /> },
  { path: STUDENT_ROUTES.community, name: 'Community', icon: <Users size={18} /> },
  { path: STUDENT_ROUTES.settings, name: 'Settings', icon: <Settings size={18} /> }
]

function CourseDetailsRoute({ courses, setSelectedClassroomCourse, ...props }) {
  const { id } = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    if (id && courses.some((c) => c.id === id)) setSelectedClassroomCourse(id)
  }, [id, courses, setSelectedClassroomCourse])
  return (
    <ClassroomsPage
      {...props}
      courses={courses}
      selectedClassroomCourse={id || props.selectedClassroomCourse}
      onBack={() => navigate(STUDENT_ROUTES.courses)}
      backLabel="My Courses"
      onViewQuizProgress={() => navigate(STUDENT_ROUTES.performance)}
      onStartClassroomQuiz={props.onStartClassroomQuiz}
    />
  )
}

export default function StudentDashboard({ onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [communityTab, setCommunityTab] = useState('peers')
  const [selectedClassroomCourse, setSelectedClassroomCourse] = useState('ICT-101')
  const [plannerTasks, setPlannerTasks] = useState([
    { id: 1, text: 'Review Python OOP class constructors structure', date: '2026-05-28', completed: false, isAI: false },
    { id: 2, text: 'Solve database normalization exercises (Part A)', date: '2026-05-30', completed: true, isAI: false },
    { id: 3, text: 'Study OSI Layer transport segment protocols', date: '2026-05-29', completed: false, isAI: true, originalReason: 'Triggered from Confused Lesson Feedback' }
  ])
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskDate, setNewTaskDate] = useState('')
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState({})
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0)
  const [activeQuizState, setActiveQuizState] = useState('list')
  const [activeQuizObj, setActiveQuizObj] = useState(null)
  const [quizScoreReport, setQuizScoreReport] = useState(null)
  const [quizHistory, setQuizHistory] = useState([
    {
      id: 'h1',
      quizId: 'q1',
      quizTitle: 'Structured Programming Logic Fundamentals',
      courseId: 'ICT-101',
      date: '2026-05-15',
      percentage: 72,
      pointsAwarded: 150,
      level: 'intermediate',
      feedback: 'Good grasp of core concepts. Strengthen loop logic and list operations before advancing.',
      suggestedQuizzes: ['Python Control Structures Drill', 'OOP Fundamentals Challenge']
    }
  ])
  const [mySkillPosts, setMySkillPosts] = useState([])
  const [mySkillRequests, setMySkillRequests] = useState([])
  const [attendanceRecords] = useState([
    { id: 1, courseId: 'ICT-101', date: '2026-05-06', session: 'Python Fundamentals', status: 'present' },
    { id: 2, courseId: 'ICT-101', date: '2026-05-13', session: 'Control Structures', status: 'present' },
    { id: 3, courseId: 'ICT-101', date: '2026-05-20', session: 'OOP Basics', status: 'present' },
    { id: 4, courseId: 'ICT-102', date: '2026-05-07', session: 'ER Diagrams Intro', status: 'present' },
    { id: 5, courseId: 'ICT-102', date: '2026-05-14', session: 'Normalization Workshop', status: 'late' },
    { id: 6, courseId: 'ICT-102', date: '2026-05-21', session: 'SQL Joins Lab', status: 'absent' },
    { id: 7, courseId: 'ICT-101', date: '2026-05-27', session: 'Lists & Loops Review', status: 'present' },
    { id: 8, courseId: 'ICT-102', date: '2026-05-28', session: '2NF & 3NF Deep Dive', status: 'present' }
  ])
  const [confusionFeedbacks, setConfusionFeedbacks] = useState({
    'ICT-101': 'Understood',
    'ICT-102': 'Partially Understood',
    'ICT-103': '',
    'ICT-104': ''
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New Quiz 03 has been scheduled by Mr. U.E. Ranasooriya.', unread: true },
    { id: 2, text: 'Lecture Notes on Python Networking are now available to download.', unread: true },
    { id: 3, text: 'Tutor G.G.H.H. Prabodhana approved your Skill Barter Request.', unread: false }
  ])
  const [studentProfile, setStudentProfile] = useState({
    name: 'Livini Mallawathanthri',
    indexNo: 'UWU/CST/22/008',
    email: 'cst22008@std.uwu.ac.lk',
    school: 'Uva Wellassa University',
    avatarSeed: 'Livini',
    avatarEmoji: '🙂',
    avatarColor: 'bg-purple-600'
  })
  const [courses, setCourses] = useState([
    { id: 'ICT-101', title: 'A/L ICT Programming Logic (Python)', description: 'Master logic building, loops, arrays, and foundational OOP schemas optimized for A/L standards.', tutor: 'Mr. U.E. Ranasooriya', enrolled: true, progress: 68 },
    { id: 'ICT-102', title: 'Relational Database Management Systems', description: 'Comprehensive guide covering SQL queries, ER diagrams, 1NF, 2NF, 3NF normalization keys.', tutor: 'Mr. G.G.H.H. Prabodhana', enrolled: true, progress: 40 },
    { id: 'ICT-103', title: 'Computer Networks & Security Layers', description: 'Understand OSI models, sub-netting routing arrays, and modern threat vector protocols.', tutor: 'Mr. U.E. Ranasooriya', enrolled: false, progress: 0 },
    { id: 'ICT-104', title: 'System Analysis & Software Engineering', description: 'Deep-dive into SDLC stages, Agile sprint backlogs, UML classes, and testing matrices.', tutor: 'Mr. G.G.H.H. Prabodhana', enrolled: false, progress: 0 }
  ])
  const [points, setPoints] = useState(1250)
  const [badges, setBadges] = useState([
    { id: 'b1', name: 'Code Pioneer', desc: 'Attempted first python assessment', icon: '🐍', unlocked: true },
    { id: 'b2', name: 'Database Explorer', desc: 'Achieved 80%+ score on SQL Quiz', icon: '💾', unlocked: true },
    { id: 'b3', name: 'Network Master', desc: 'Finish network model quiz flawlessly', icon: '🌐', unlocked: false },
    { id: 'b4', name: 'Logic Master', desc: 'Score 90%+ on control structures quiz', icon: '🔄', unlocked: false },
    { id: 'b5', name: 'SQL Wizard', desc: 'Achieve 95%+ on normalization assessment', icon: '📊', unlocked: false },
    { id: 'b6', name: 'Security Guardian', desc: 'Complete network security module', icon: '🔐', unlocked: false },
    { id: 'b7', name: 'Systems Architect', desc: 'Master SDLC and UML diagrams', icon: '🏗️', unlocked: false }
  ])
  const [peerTradingOffers, setPeerTradingOffers] = useState([
    { id: 'p1', title: 'Share Python Notes', partner: 'H. K. Silva', reward: '3 skill points', status: 'pending' },
    { id: 'p2', title: 'Swap Database Quiz Tips', partner: 'A. Perera', reward: 'Access to SQL vault', status: 'pending' },
    { id: 'p3', title: 'Review React Project', partner: 'N. Fernando', reward: 'Code review credits', status: 'accepted' }
  ])
  const [peerLearningPeers, setPeerLearningPeers] = useState([
    { id: 'pl1', name: 'M. Nawarathne', expertise: 'Database Modeling', field: 'ICT-102', quizLevel: 'expert', rating: 4.9, reason: 'Scored 92% on Database Quiz 01', mutualInterest: 'Database projects, ER diagrams', status: 'available' },
    { id: 'pl2', name: 'K. Jayasinghe', expertise: 'Python Algorithms', field: 'ICT-101', quizLevel: 'expert', rating: 4.8, reason: 'Scored 88% on Programming Quiz 01', mutualInterest: 'Algorithm practice, code review', status: 'available' },
    { id: 'pl3', name: 'S. Fernando', expertise: 'Systems Design', field: 'ICT-104', quizLevel: 'expert', rating: 4.7, reason: 'Scored 91% on Web Development Quiz 01', mutualInterest: 'UML, agile study groups', status: 'connected' },
    { id: 'pl4', name: 'R. Perera', expertise: 'SQL Query Optimization', field: 'ICT-102', quizLevel: 'intermediate', rating: 4.6, reason: 'Mid-level database performance', mutualInterest: 'Exam preparation and peer review', status: 'incoming' },
    { id: 'pl5', name: 'A. Perera', expertise: 'Networking & OSI', field: 'ICT-103', quizLevel: 'expert', rating: 4.8, reason: 'Scored 95% on Networking Quiz 01', mutualInterest: 'Subnetting labs, security', status: 'available' }
  ])
  const [openPeerChatId, setOpenPeerChatId] = useState('pl3')
  const [peerChatMessages, setPeerChatMessages] = useState({
    pl3: [
      { id: 'm1', sender: 'peer', type: 'text', content: 'Hi Livini! I saw your request on database normalization. Want to review the ER diagrams together tonight?', time: '10:12 AM' }
    ]
  })
  const getQuizPerformanceLevel = (percentage) => {
    if (percentage >= 80) return 'expert'
    if (percentage >= 50) return 'intermediate'
    return 'beginner'
  }

  const getSuggestedQuizzesForLevel = (level, courseId) => {
    const suggestions = {
      beginner: {
        'ICT-101': ['Python Variables & Types Basics', 'Simple Loop Exercises'],
        'ICT-102': ['SQL SELECT Fundamentals', 'ER Diagram Basics'],
        'ICT-103': ['OSI Model Intro Quiz', 'Subnetting Starter'],
        'ICT-104': ['SDLC Overview Quiz', 'UML Class Diagram Basics']
      },
      intermediate: {
        'ICT-101': ['Python Control Structures Drill', 'OOP Fundamentals Challenge'],
        'ICT-102': ['Normalization Workshop Quiz', 'SQL JOIN Practice'],
        'ICT-103': ['Routing Protocols Quiz', 'Firewall Concepts'],
        'ICT-104': ['Agile Sprint Planning Quiz', 'Use Case Modeling']
      },
      expert: {
        'ICT-101': ['Advanced Algorithm Patterns', 'Python Expert Challenge'],
        'ICT-102': ['BCNF & Advanced SQL', 'Database Design Masterclass'],
        'ICT-103': ['Network Security Expert', 'Advanced Subnetting'],
        'ICT-104': ['Systems Architecture Exam', 'UML Advanced Patterns']
      }
    }
    return suggestions[level]?.[courseId] || suggestions[level]?.['ICT-101'] || []
  }

  const buildQuizFeedback = (percentage, courseId) => {
    const level = getQuizPerformanceLevel(percentage)
    const feedbackMap = {
      beginner: 'Focus on foundational concepts. Review lecture notes and attempt beginner-level practice quizzes to build confidence.',
      intermediate: 'Solid understanding with room to grow. Target intermediate quizzes to bridge gaps before expert-level assessments.',
      expert: 'Outstanding performance! Challenge yourself with expert quizzes and mentor peers in community study groups.'
    }
    return {
      level,
      feedback: feedbackMap[level],
      suggestedQuizzes: getSuggestedQuizzesForLevel(level, courseId)
    }
  }

  const isQuizCompleted = (quizId) => quizHistory.some((entry) => entry.quizId === quizId)

  const mockQuizzes = useMemo(() => [
    {
      id: 'q1',
      title: 'Programming Quiz 01 — Logic Fundamentals',
      courseId: 'ICT-101',
      category: 'Programming',
      dueDate: '2026-06-15',
      duration: '5 Mins',
      questions: [
        { q: 'What is the correct output of the expression: print(2 ** 3)?', opts: ['6', '8', '9', 'Error'], ans: 1 },
        { q: 'Which logical structure is best suited for executing code arrays block recursively?', opts: ['For Loop', 'If-Else Branch', 'While Loop', 'Class Definition'], ans: 2 },
        { q: 'In Python programming, arrays are structurally managed using which built-in data type?', opts: ['Tuple', 'Set', 'List', 'String'], ans: 2 }
      ]
    },
    {
      id: 'q2',
      title: 'Database Quiz 01 — Normalization Keys',
      courseId: 'ICT-102',
      category: 'Database',
      dueDate: '2026-06-20',
      duration: '10 Mins',
      questions: [
        { q: 'Which NF removes partial dependency of non-prime attributes on composite keys?', opts: ['1NF', '2NF', '3NF', 'BCNF'], ans: 1 },
        { q: 'What database constraint guarantees record entity uniqueness inside a relational grid?', opts: ['Foreign Key', 'Primary Key', 'Index Flag', 'Candidate Identifier'], ans: 1 }
      ]
    },
    {
      id: 'q3',
      title: 'Networking Quiz 01 — OSI Model',
      courseId: 'ICT-103',
      category: 'Networking',
      dueDate: '2026-06-25',
      duration: '8 Mins',
      questions: [
        { q: 'Which OSI layer handles routing between networks?', opts: ['Data Link', 'Network', 'Transport', 'Session'], ans: 1 },
        { q: 'What protocol operates at the Transport layer?', opts: ['IP', 'TCP', 'Ethernet', 'ARP'], ans: 1 }
      ]
    },
    {
      id: 'q4',
      title: 'Web Development Quiz 01 — SDLC Basics',
      courseId: 'ICT-104',
      category: 'Web Development',
      dueDate: '2026-07-01',
      duration: '7 Mins',
      questions: [
        { q: 'Which SDLC model is iterative and incremental?', opts: ['Waterfall', 'Agile', 'V-Model', 'Big Bang'], ans: 1 },
        { q: 'UML diagrams are primarily used for?', opts: ['Hardware design', 'Software modeling', 'Network topology', 'Database indexing'], ans: 1 }
      ]
    }
  ], [])

  const getQuizForCourse = (courseId) => mockQuizzes.find((q) => q.courseId === courseId)

  const studentCourseLevels = useMemo(
    () => getStudentCourseLevels(courses, quizHistory),
    [courses, quizHistory]
  )

  const expertMentorPeers = useMemo(
    () => getExpertMentorsForStudent(peerLearningPeers, courses, quizHistory),
    [peerLearningPeers, courses, quizHistory]
  )

  const enrolledCoursesCount = courses.filter((c) => c.enrolled).length
  const completedQuizzesCount = quizHistory.length
  const currentQuizAverage = quizHistory.length > 0
    ? `${Math.round(quizHistory.reduce((s, q) => s + q.percentage, 0) / quizHistory.length)}%`
    : '—'
  const upcomingQuizzes = mockQuizzes
    .filter((q) => !isQuizCompleted(q.id))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3)

  const attendedCount = attendanceRecords.filter((r) => r.status === 'present' || r.status === 'late').length
  const attendancePercentage = attendanceRecords.length > 0
    ? Math.round((attendedCount / attendanceRecords.length) * 100)
    : 0

  const getAdaptiveDifficulty = () => {
    const last = quizHistory[0] || quizScoreReport
    if (!last) return { level: 'Medium', label: 'Standard difficulty (baseline)' }
    const pct = last.percentage
    if (pct >= 80) return { level: 'Hard', label: 'Advanced — adapted up from strong performance' }
    if (pct >= 50) return { level: 'Medium', label: 'Intermediate — maintaining current level' }
    return { level: 'Easy', label: 'Foundational — adapted down to support learning' }
  }

  const leaderboardEntries = useMemo(() => {
    const base = [
      { indexNo: 'UWU/CST/22/045', name: 'K. Jayasinghe', points: 1580, emoji: '🚀', badges: 4 },
      { indexNo: 'UWU/CST/22/008', name: studentProfile.name, points, emoji: studentProfile.avatarEmoji || '🙂', badges: badges.filter((b) => b.unlocked).length },
      { indexNo: 'UWU/CST/22/062', name: 'R.M.K.G.D.S.N. Rathnayake', points: 1180, emoji: '📈', badges: 3 },
      { indexNo: 'UWU/CST/22/056', name: 'P.G.D.K.J. Wijesekare', points: 1050, emoji: '💡', badges: 2 },
      { indexNo: 'UWU/CST/22/033', name: 'M. Nawarathne', points: 980, emoji: '💾', badges: 2 },
      { indexNo: 'UWU/CST/22/041', name: 'S. Fernando', points: 870, emoji: '🏗️', badges: 1 }
    ]
    return base
      .map((entry) => ({
        ...entry,
        rankTitle: entry.points >= 1500 ? 'Code Titan' : entry.points >= 1100 ? 'Code Champion' : entry.points >= 800 ? 'Rising Coder' : 'Code Cadet'
      }))
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
  }, [points, studentProfile.name, studentProfile.avatarEmoji, badges])

  const leaderboardRank = leaderboardEntries.find((e) => e.indexNo === studentProfile.indexNo)?.rank ?? '-'

  const triggerToast = (msg) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  const openCommunity = (tab = 'peers') => {
    setCommunityTab(tab)
    navigate(STUDENT_ROUTES.community)
  }

  const openSubPage = (path, _backTo) => {
    const routeMap = {
      quizzes: STUDENT_ROUTES.quizzes,
      planner: STUDENT_ROUTES.studyPlanner,
      progress: STUDENT_ROUTES.performance,
      attendance: STUDENT_ROUTES.attendance,
      classrooms: STUDENT_ROUTES.course(selectedClassroomCourse),
      library: STUDENT_ROUTES.courses
    }
    navigate(routeMap[path] || path)
    if (path === 'quizzes') setActiveQuizState('list')
  }

  const getAISuggestions = () => {
    const suggestions = []
    if (confusionFeedbacks['ICT-102'] === 'Partially Understood' || confusionFeedbacks['ICT-102'] === 'Confused') {
      suggestions.push({
        topic: 'Database Schema Normalization',
        reason: 'Flagged as Confused',
        recommendation: 'Re-watch G.G.H.H. Prabodhana’s Lesson 3 and practice 2NF mapping.',
        actionTask: 'Construct normal forms grid practice'
      })
    }
    const failedQuizzes = mockQuizzes.filter((q) => quizScoreReport?.quizId === q.id && quizScoreReport.percentage < 70)
    if (failedQuizzes.length > 0 || !quizScoreReport) {
      suggestions.push({
        topic: 'Python Loops & Lists',
        reason: 'Average quiz score requires boosting',
        recommendation: 'Enroll in programming exercises list to unlock Level Up Badge.',
        actionTask: 'Attempt coding constructs worksheet'
      })
    }
    return suggestions
  }

  const handleAddRecommendationToPlanner = (rec) => {
    const isAlreadyAdded = plannerTasks.some((t) => t.text === rec.actionTask)
    if (isAlreadyAdded) {
      triggerToast('Already scheduled in your active agenda.')
      return
    }
    const newTask = {
      id: Date.now(),
      text: `AI Task: ${rec.actionTask}`,
      date: new Date().toISOString().split('T')[0],
      completed: false,
      isAI: true,
      originalReason: rec.reason
    }
    setPlannerTasks([newTask, ...plannerTasks])
    triggerToast('AI generated task injected successfully!')
  }

  const handleConfusionLevelSubmit = (courseId, level) => {
    setConfusionFeedbacks({ ...confusionFeedbacks, [courseId]: level })
    let msg = `Confusion updated to ${level}. `
    if (level === 'Confused') {
      msg += 'AI logic updated and generated focus recommendations.'
    } else {
      msg += 'Tutor notified of lesson progress!'
    }
    triggerToast(msg)
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      date: newTaskDate || new Date().toISOString().split('T')[0],
      completed: false,
      isAI: false
    }
    setPlannerTasks([newTask, ...plannerTasks])
    setNewTaskText('')
    setNewTaskDate('')
    triggerToast('New goal successfully added to your planner!')
  }

  const handleToggleTask = (taskId) => {
    setPlannerTasks(plannerTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
    triggerToast('Updated plan checkpoint state!')
  }

  const handleDeleteTask = (taskId) => {
    setPlannerTasks(plannerTasks.filter((task) => task.id !== taskId))
    triggerToast('Goal removed from scheduling matrix.')
  }

  const handleEditTask = (taskId, updates) => {
    setPlannerTasks(plannerTasks.map((task) =>
      task.id === taskId ? { ...task, ...updates } : task
    ))
    triggerToast('Task updated successfully!')
  }

  const handleEnrollCourse = (courseId) => {
    setCourses(courses.map((c) => c.id === courseId ? { ...c, enrolled: true, progress: c.progress || 5 } : c))
    triggerToast('Course enrollment successfully recorded.')
  }

  const handleStartQuiz = (quiz) => {
    setActiveQuizObj(quiz)
    setCurrentQuizQuestionIndex(0)
    setQuizSelectedAnswers({})
    setActiveQuizState('active')
  }

  const handleStartQuizFromClassroom = (quiz) => {
    handleStartQuiz(quiz)
    navigate(STUDENT_ROUTES.quiz(quiz.id))
  }

  const handleQuizNext = () => {
    if (!activeQuizObj) return
    if (currentQuizQuestionIndex < activeQuizObj.questions.length - 1) {
      setCurrentQuizQuestionIndex(currentQuizQuestionIndex + 1)
    }
  }

  const handleQuizPrev = () => {
    if (currentQuizQuestionIndex > 0) {
      setCurrentQuizQuestionIndex(currentQuizQuestionIndex - 1)
    }
  }

  const handleBackToQuizList = () => {
    setActiveQuizState('list')
    setActiveQuizObj(null)
    setCurrentQuizQuestionIndex(0)
    setQuizSelectedAnswers({})
  }

  const handleSelectQuizOption = (optionIdx) => {
    setQuizSelectedAnswers({
      ...quizSelectedAnswers,
      [currentQuizQuestionIndex]: optionIdx
    })
  }

  const handleSubmitQuizAnswers = () => {
    if (!activeQuizObj) return
    let correctCount = 0
    activeQuizObj.questions.forEach((q, idx) => {
      if (quizSelectedAnswers[idx] === q.ans) {
        correctCount++
      }
    })
    const percentage = Math.round((correctCount / activeQuizObj.questions.length) * 100)
    const pointsAwarded = correctCount * 50
    const { level, feedback, suggestedQuizzes } = buildQuizFeedback(percentage, activeQuizObj.courseId)
    setPoints((prev) => prev + pointsAwarded)
    if (activeQuizObj.id === 'q1' && percentage >= 60) {
      setBadges((prev) => prev.map((b) => b.id === 'b1' ? { ...b, unlocked: true } : b))
    }
    if (activeQuizObj.id === 'q2' && percentage >= 80) {
      setBadges((prev) => prev.map((b) => b.id === 'b2' ? { ...b, unlocked: true } : b))
    }
    const report = {
      quizId: activeQuizObj.id,
      quizTitle: activeQuizObj.title,
      courseId: activeQuizObj.courseId,
      correctCount,
      totalCount: activeQuizObj.questions.length,
      percentage,
      pointsAwarded,
      level,
      feedback,
      suggestedQuizzes
    }
    setQuizScoreReport(report)
    setQuizHistory((prev) => [
      {
        id: Date.now().toString(),
        quizId: activeQuizObj.id,
        quizTitle: activeQuizObj.title,
        courseId: activeQuizObj.courseId,
        date: new Date().toISOString().split('T')[0],
        percentage,
        pointsAwarded,
        correctCount,
        totalCount: activeQuizObj.questions.length,
        level,
        feedback,
        suggestedQuizzes
      },
      ...prev.filter((entry) => entry.quizId !== activeQuizObj.id)
    ])
    setCourses((prev) => prev.map((c) => {
      if (c.id === activeQuizObj.courseId) {
        return { ...c, progress: Math.min(c.progress + 20, 100) }
      }
      return c
    }))
    setActiveQuizState('result')
    triggerToast(`Quiz Submitted! Earned +${pointsAwarded} XP`)
  }

  const getRankInfo = () => {
    if (points >= 1500) {
      return { current: 'Code Titan', currentEmoji: '⚡', next: 'Legendary Scholar', nextEmoji: '🌟', nextPoints: 2000 }
    }
    if (points >= 1100) {
      return { current: 'Code Champion', currentEmoji: '🏆', next: 'Code Titan', nextEmoji: '⚡', nextPoints: 1500 }
    }
    if (points >= 800) {
      return { current: 'Rising Coder', currentEmoji: '📈', next: 'Code Champion', nextEmoji: '🏆', nextPoints: 1100 }
    }
    return { current: 'Code Cadet', currentEmoji: '👨‍🚀', next: 'Rising Coder', nextEmoji: '📈', nextPoints: 800 }
  }

  const handleAcceptPeerTrade = (offerId) => {
    setPeerTradingOffers(peerTradingOffers.map((offer) =>
      offer.id === offerId ? { ...offer, status: 'accepted' } : offer
    ))
    triggerToast('Peer trade offer accepted. Check your collaboration feed!')
  }

  const handleDeclinePeerTrade = (offerId) => {
    setPeerTradingOffers(peerTradingOffers.map((offer) =>
      offer.id === offerId ? { ...offer, status: 'declined' } : offer
    ))
    triggerToast('Peer trade offer declined.')
  }

  const buildWeakAreasSummary = () => {
    const weaknesses = []
    if (confusionFeedbacks['ICT-101'] === 'Partially Understood' || confusionFeedbacks['ICT-101'] === 'Confused' || courses.find((c) => c.id === 'ICT-101')?.progress < 70) {
      weaknesses.push('Python programming logic')
    }
    if (confusionFeedbacks['ICT-102'] === 'Partially Understood' || confusionFeedbacks['ICT-102'] === 'Confused' || courses.find((c) => c.id === 'ICT-102')?.progress < 70) {
      weaknesses.push('Database systems')
    }
    if (confusionFeedbacks['ICT-103'] === 'Partially Understood' || confusionFeedbacks['ICT-103'] === 'Confused' || courses.find((c) => c.id === 'ICT-103')?.progress < 70) {
      weaknesses.push('Networking & security')
    }
    if (confusionFeedbacks['ICT-104'] === 'Partially Understood' || confusionFeedbacks['ICT-104'] === 'Confused' || courses.find((c) => c.id === 'ICT-104')?.progress < 70) {
      weaknesses.push('Systems analysis')
    }
    return weaknesses.length > 0 ? weaknesses.join(', ') : 'No strong weakness detected yet. Keep learning!'
  }

  const handleSendPeerRequest = (peerId) => {
    const peer = peerLearningPeers.find((peer) => peer.id === peerId)
    if (!peer) return

    setPeerLearningPeers(peerLearningPeers.map((peer) =>
      peer.id === peerId ? { ...peer, status: 'requested' } : peer
    ))
    triggerToast('Peer request sent. Waiting for the other party to accept.')
  }

  const handlePeerAcceptedConnection = (peerId) => {
    const peer = peerLearningPeers.find((peer) => peer.id === peerId)
    if (!peer) return

    setPeerLearningPeers(peerLearningPeers.map((peer) =>
      peer.id === peerId ? { ...peer, status: 'connected' } : peer
    ))
    setOpenPeerChatId(peerId)
    triggerToast(`You accepted ${peer.name}'s request. Chat is now open.`)
    setNotifications((prev) => [
      { id: Date.now(), text: `You accepted ${peer.name}'s peer request.`, unread: true },
      ...prev
    ])
  }

  const handlePeerDeclineConnection = (peerId) => {
    const peer = peerLearningPeers.find((peer) => peer.id === peerId)
    if (!peer) return

    setPeerLearningPeers(peerLearningPeers.map((peer) =>
      peer.id === peerId ? { ...peer, status: 'declined' } : peer
    ))
    triggerToast(`You declined ${peer.name}'s request.`)
  }

  const handlePeerAcceptedByOther = (peerId) => {
    const peer = peerLearningPeers.find((p) => p.id === peerId)
    if (!peer) return
    setPeerLearningPeers((prev) => prev.map((p) => p.id === peerId ? { ...p, status: 'connected' } : p))
    setNotifications((prev) => [
      { id: Date.now(), text: `${peer.name} accepted your peer request.`, unread: true },
      ...prev
    ])
    triggerToast(`${peer.name} accepted your request. See Notifications to open chat.`)
  }

  const handleEndPeerConnection = (peerId) => {
    const peer = peerLearningPeers.find((p) => p.id === peerId)
    if (!peer) return
    setPeerLearningPeers(peerLearningPeers.map((p) => p.id === peerId ? { ...p, status: 'available' } : p))
    setOpenPeerChatId(null)
    setPeerChatMessages((prev) => ({ ...prev, [peerId]: [] }))
    setNotifications((prev) => [
      { id: Date.now(), text: `Connection with ${peer.name} ended.`, unread: true },
      ...prev
    ])
    triggerToast(`Ended connection with ${peer.name}.`)
  }

  const handleSendPeerChatMessage = (peerId, message) => {
    setPeerChatMessages((prev) => ({
      ...prev,
      [peerId]: [
        ...(prev[peerId] || []),
        { id: Date.now().toString(), ...message }
      ]
    }))
  }

  const handleSendPeerAttachment = (peerId, file) => {
    if (!file) return
    setPeerChatMessages((prev) => ({
      ...prev,
      [peerId]: [
        ...(prev[peerId] || []),
        {
          id: Date.now().toString(),
          sender: 'me',
          type: 'attachment',
          file,
          fileName: file.name,
          fileType: file.type,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }))
    triggerToast(`${file.name} shared in chat.`)
  }

  const handleDownloadResource = (resource, course) => {
    const content = `EduMate Learning Material\nCourse: ${course.id} - ${course.title}\nResource: ${resource.name}\nTutor: ${course.tutor}\n\n--- Demo content preview ---\nThis file was downloaded from the EduMate LMS student portal.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = resource.name.replace(/\s+/g, '_').replace(/[()]/g, '')
    link.click()
    URL.revokeObjectURL(url)
    triggerToast(`Downloaded ${resource.name}`)
  }

  const handleGenerateSchedule = () => {
    const today = new Date()
    const generated = []
    const enrolled = courses.filter((c) => c.enrolled)

    enrolled.forEach((course, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() + i + 1)
      generated.push({
        id: Date.now() + i,
        text: `AI Schedule: Review ${course.title.split('(')[0].trim()} modules`,
        date: date.toISOString().split('T')[0],
        completed: false,
        isAI: true,
        originalReason: 'Generated from course progress analytics'
      })
    })

    if (confusionFeedbacks['ICT-102'] === 'Partially Understood' || confusionFeedbacks['ICT-102'] === 'Confused') {
      const date = new Date(today)
      date.setDate(date.getDate() + 2)
      generated.push({
        id: Date.now() + 50,
        text: 'AI Schedule: Practice database normalization exercises',
        date: date.toISOString().split('T')[0],
        completed: false,
        isAI: true,
        originalReason: 'Triggered by confusion feedback on ICT-102'
      })
    }

    const quizDate = new Date(today)
    quizDate.setDate(quizDate.getDate() + 3)
    generated.push({
      id: Date.now() + 100,
      text: 'AI Schedule: Attempt recommended quiz for weak areas',
      date: quizDate.toISOString().split('T')[0],
      completed: false,
      isAI: true,
      originalReason: 'Rule-based recommendation system'
    })

    const existingTexts = new Set(plannerTasks.map((t) => t.text))
    const toAdd = generated.filter((t) => !existingTexts.has(t.text))
    if (toAdd.length === 0) {
      triggerToast('Your study schedule is already up to date.')
      return
    }
    setPlannerTasks([...toAdd, ...plannerTasks])
    triggerToast(`Generated ${toAdd.length} AI study tasks for the week!`)
  }

  const handlePostSkill = (skill, description) => {
    setMySkillPosts((prev) => [
      { id: Date.now().toString(), skill, description, status: 'Active', postedAt: new Date().toISOString().split('T')[0] },
      ...prev
    ])
    setNotifications((prev) => [
      { id: Date.now(), text: `Your skill offer "${skill}" is now visible to matched peers.`, unread: true },
      ...prev
    ])
    triggerToast('Skill offer published! Peers can now request an exchange.')
  }

  const handleRequestSkill = (skill, description) => {
    setMySkillRequests((prev) => [
      { id: Date.now().toString(), skill, description, status: 'Matching', postedAt: new Date().toISOString().split('T')[0] },
      ...prev
    ])
    setNotifications((prev) => [
      { id: Date.now(), text: `Learning request for "${skill}" submitted. Matching peers will be notified.`, unread: true },
      ...prev
    ])
    triggerToast('Learning request submitted. The system will match you with peers.')
  }

  const pageTitle = routeTitles[location.pathname]
    || (location.pathname.startsWith('/course/') ? 'Course Details' : null)
    || (location.pathname.startsWith('/quiz/') ? 'Quiz Attempt' : null)
    || (location.pathname.startsWith('/result/') ? 'Quiz Result' : null)
    || 'Dashboard'

  const peerLearningPage = (
    <StudentPeerLearning
      embedded
      peerLearningPeers={peerLearningPeers}
      expertMentorPeers={expertMentorPeers}
      studentCourseLevels={studentCourseLevels}
      handleSendPeerRequest={handleSendPeerRequest}
      buildWeakAreasSummary={buildWeakAreasSummary}
      openPeerChatId={openPeerChatId}
      setOpenPeerChatId={setOpenPeerChatId}
      peerChatMessages={peerChatMessages}
      handleSendPeerChatMessage={handleSendPeerChatMessage}
      handleSendPeerAttachment={handleSendPeerAttachment}
      handlePeerAcceptedConnection={handlePeerAcceptedConnection}
      handlePeerDeclineConnection={handlePeerDeclineConnection}
      handleEndPeerConnection={handleEndPeerConnection}
    />
  )

  const notificationsPage = (
    <Notifications
      notifications={notifications}
      markRead={(id) => setNotifications(notifications.map((n) => n.id === id ? { ...n, unread: false } : n))}
      clearNotification={(id) => setNotifications(notifications.filter((n) => n.id !== id))}
      clearAll={() => setNotifications([])}
    />
  )

  const communityPage = (
    <CommunityPage
      tab={communityTab}
      setTab={setCommunityTab}
      peersContent={peerLearningPage}
      onSkillBarterClick={() => triggerToast('Skill Barter is coming soon — a teammate is building this feature.')}
    />
  )

  return (
    <div className="student-portal-shell">
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/90 border border-cyan-500/30 text-cyan-200 px-5 py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-medium text-sm">{toastMsg}</span>
        </div>
      )}

      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">E</div>
          <div>
            <p className="sidebar-label">EduMate</p>
            <span className="sidebar-note">Student Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => { if (item.path === STUDENT_ROUTES.quizzes) setActiveQuizState('list') }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {location.pathname === item.path && <ChevronRight size={16} className="nav-arrow" />}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-pill" type="button" onClick={onLogout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="admin-main-panel">
        <header className="admin-main-header">
          <div>
            <p className="page-subtitle">Student Portal</p>
            <h1 className="page-title">{pageTitle}</h1>
          </div>
          <div className="header-actions">
            <button className="icon-pill relative" type="button" onClick={() => navigate(STUDENT_ROUTES.notifications)}>
              <Bell size={16} />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            <button
              className="profile-pill"
              type="button"
              onClick={() => navigate(STUDENT_ROUTES.profile)}
            >
              <User size={16} />
              Student
              <ChevronDown size={16} />
            </button>
            <button className="logout-pill" type="button" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </header>

        <div className="student-page-content">
          <Routes>
            <Route path="/" element={<Navigate to={STUDENT_ROUTES.dashboard} replace />} />
            <Route path={STUDENT_ROUTES.dashboard} element={(
              <StudentOverview
                studentProfile={studentProfile}
                enrolledCoursesCount={enrolledCoursesCount}
                completedQuizzesCount={completedQuizzesCount}
                currentQuizAverage={currentQuizAverage}
                upcomingQuizzes={upcomingQuizzes}
                plannerTasks={plannerTasks}
                courses={courses}
                points={points}
                badges={badges}
                rankInfo={getRankInfo()}
                peerTradingOffers={peerTradingOffers}
                navigate={navigate}
                openSubPage={openSubPage}
                openCommunity={openCommunity}
                setSelectedClassroomCourse={setSelectedClassroomCourse}
                getAISuggestions={getAISuggestions}
                handleAddRecommendationToPlanner={handleAddRecommendationToPlanner}
                handleAcceptPeerTrade={handleAcceptPeerTrade}
                handleDeclinePeerTrade={handleDeclinePeerTrade}
                attendancePercentage={attendancePercentage}
                leaderboardRank={leaderboardRank}
              />
            )} />
            <Route path={STUDENT_ROUTES.courses} element={(
              <CourseLibrary
                courses={courses}
                handleEnrollCourse={handleEnrollCourse}
                setSelectedClassroomCourse={setSelectedClassroomCourse}
                navigate={navigate}
              />
            )} />
            <Route path="/course/:id" element={(
              <CourseDetailsRoute
                courses={courses}
                selectedClassroomCourse={selectedClassroomCourse}
                setSelectedClassroomCourse={setSelectedClassroomCourse}
                confusionFeedbacks={confusionFeedbacks}
                handleConfusionLevelSubmit={handleConfusionLevelSubmit}
                onDownloadResource={handleDownloadResource}
                quizHistory={quizHistory}
                isQuizCompleted={isQuizCompleted}
                getQuizForCourse={getQuizForCourse}
                onStartClassroomQuiz={handleStartQuizFromClassroom}
              />
            )} />
            <Route path={STUDENT_ROUTES.courseMaterials} element={(
              <CourseMaterialsPage courses={courses} onDownloadResource={handleDownloadResource} />
            )} />
            <Route path={STUDENT_ROUTES.quizzes} element={(
              <QuizListPage mockQuizzes={mockQuizzes} isQuizCompleted={isQuizCompleted} adaptiveDifficulty={getAdaptiveDifficulty()} />
            )} />
            <Route path="/quiz/:id" element={(
              <QuizAttemptPage
                mockQuizzes={mockQuizzes}
                currentQuizQuestionIndex={currentQuizQuestionIndex}
                quizSelectedAnswers={quizSelectedAnswers}
                handleSelectQuizOption={handleSelectQuizOption}
                handleSubmitQuizAnswers={handleSubmitQuizAnswers}
                handleQuizNext={handleQuizNext}
                handleQuizPrev={handleQuizPrev}
                setActiveQuizObj={setActiveQuizObj}
                setCurrentQuizQuestionIndex={setCurrentQuizQuestionIndex}
                setQuizSelectedAnswers={setQuizSelectedAnswers}
                setActiveQuizState={setActiveQuizState}
                triggerToast={triggerToast}
              />
            )} />
            <Route path="/result/:id" element={(
              <QuizResultPage quizHistory={quizHistory} mockQuizzes={mockQuizzes} />
            )} />
            <Route path={STUDENT_ROUTES.performance} element={(
              <PerformancePage
                quizHistory={quizHistory}
                attendanceRecords={attendanceRecords}
                courses={courses}
                attendancePercentage={attendancePercentage}
                buildWeakAreasSummary={buildWeakAreasSummary}
              />
            )} />
            <Route path={STUDENT_ROUTES.aiFeedback} element={(
              <AIFeedbackPage
                getAISuggestions={getAISuggestions}
                buildWeakAreasSummary={buildWeakAreasSummary}
                quizHistory={quizHistory}
                handleAddRecommendationToPlanner={handleAddRecommendationToPlanner}
              />
            )} />
            <Route path={STUDENT_ROUTES.studyPlanner} element={(
              <StudyPlanner
                plannerTasks={plannerTasks}
                newTaskText={newTaskText}
                newTaskDate={newTaskDate}
                setNewTaskText={setNewTaskText}
                setNewTaskDate={setNewTaskDate}
                handleAddTask={handleAddTask}
                handleToggleTask={handleToggleTask}
                handleDeleteTask={handleDeleteTask}
                handleEditTask={handleEditTask}
                handleGenerateSchedule={handleGenerateSchedule}
              />
            )} />
            <Route path={STUDENT_ROUTES.rewards} element={(
              <RewardsPage points={points} badges={badges} getRankInfo={getRankInfo} />
            )} />
            <Route path={STUDENT_ROUTES.leaderboard} element={(
              <LeaderboardPage leaderboardEntries={leaderboardEntries} studentProfile={studentProfile} getRankInfo={getRankInfo} />
            )} />
            <Route path={STUDENT_ROUTES.profile} element={(
              <ProfilePage studentProfile={studentProfile} setStudentProfile={setStudentProfile} points={points} badges={badges} triggerToast={triggerToast} />
            )} />
            <Route path={STUDENT_ROUTES.attendance} element={(
              <AttendancePage attendanceRecords={attendanceRecords} courses={courses} attendancePercentage={attendancePercentage} />
            )} />
            <Route path={STUDENT_ROUTES.notifications} element={notificationsPage} />
            <Route path={STUDENT_ROUTES.community} element={communityPage} />
            <Route path={STUDENT_ROUTES.settings} element={<SettingsPage />} />
            <Route path="*" element={<Navigate to={STUDENT_ROUTES.dashboard} replace />} />
          </Routes>
        </div>
      </main>

    </div>
  )
}
