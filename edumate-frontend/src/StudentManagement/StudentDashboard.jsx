<<<<<<< Updated upstream
﻿import './Student.css'
import { useState, useMemo, useEffect, useCallback } from 'react'
=======
import './Student.css'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
>>>>>>> Stashed changes
import ConfirmationModal from './components/ConfirmationModal'
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
    if (id && courses.some((c) => String(c.id) === String(id) || String(c.course_id) === String(id))) setSelectedClassroomCourse(id)
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

export default function StudentDashboard({ onLogout, student, token }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [communityTab, setCommunityTab] = useState('peers')
  const [selectedClassroomCourse, setSelectedClassroomCourse] = useState('')
  const [plannerTasks, setPlannerTasks] = useState([])
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskDate, setNewTaskDate] = useState('')
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState({})
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0)
  const [activeQuizState, setActiveQuizState] = useState('list')
  const [activeQuizObj, setActiveQuizObj] = useState(null)
  const [quizScoreReport, setQuizScoreReport] = useState(null)
  const [quizHistory, setQuizHistory] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false)
  const [quizError, setQuizError] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [mySkillPosts, setMySkillPosts] = useState([])
  const [mySkillRequests, setMySkillRequests] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [confusionFeedbacks, setConfusionFeedbacks] = useState({})
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New Quiz 03 has been scheduled by Mr. U.E. Ranasooriya.', unread: true },
    { id: 2, text: 'Lecture Notes on Python Networking are now available to download.', unread: true },
    { id: 3, text: 'Tutor G.G.H.H. Prabodhana approved your Skill Barter Request.', unread: false }
  ])
  const [studentProfile, setStudentProfile] = useState({
    name: student ? `${student.first_name} ${student.last_name}` : 'Student',
    indexNo: student ? `ID-${student.student_id}` : '—',
    email: student?.email || '',
    school: student?.school_name || '',
    avatarSeed: student?.first_name || 'Student',
    avatarEmoji: '🙂',
    avatarColor: 'bg-purple-600'
  })

  const [courses, setCourses] = useState([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)
  const [points, setPoints] = useState(0)
  const [badges, setBadges] = useState([
    { id: 'b1', name: 'Quiz Pioneer', desc: 'Attempted your first quiz', icon: '🎯', unlocked: false },
    { id: 'b2', name: 'High Scorer', desc: 'Scored 80%+ on a quiz', icon: '💾', unlocked: false },
    { id: 'b3', name: 'Perfect Score', desc: 'Scored 100% on a quiz', icon: '🌟', unlocked: false },
    { id: 'b4', name: 'Consistent Learner', desc: 'Completed 3 or more quizzes', icon: '🔄', unlocked: false },
    { id: 'b5', name: 'Excellence', desc: 'Average score above 85%', icon: '📊', unlocked: false },
    { id: 'b6', name: 'Scholar', desc: 'Completed 5 or more quizzes', icon: '🔐', unlocked: false },
    { id: 'b7', name: 'Master', desc: 'Completed 10 or more quizzes', icon: '🏗️', unlocked: false }
  ])

  useEffect(() => {
    if (!student) return
    setStudentProfile((prev) => ({
      ...prev,
      name: `${student.first_name} ${student.last_name}`,
      indexNo: `ID-${student.student_id}`,
      email: student.email || prev.email,
      school: student.school_name || prev.school,
      avatarSeed: student.first_name || 'Student'
    }))
  }, [student])

  useEffect(() => {
    if (quizHistory.length === 0) return
    const avg = quizHistory.reduce((s, q) => s + (q.percentage || 0), 0) / quizHistory.length
    setBadges([
      { id: 'b1', name: 'Quiz Pioneer', desc: 'Attempted your first quiz', icon: '🎯', unlocked: true },
      { id: 'b2', name: 'High Scorer', desc: 'Scored 80%+ on a quiz', icon: '💾', unlocked: quizHistory.some(q => (q.percentage || 0) >= 80) },
      { id: 'b3', name: 'Perfect Score', desc: 'Scored 100% on a quiz', icon: '🌟', unlocked: quizHistory.some(q => (q.percentage || 0) >= 100) },
      { id: 'b4', name: 'Consistent Learner', desc: 'Completed 3 or more quizzes', icon: '🔄', unlocked: quizHistory.length >= 3 },
      { id: 'b5', name: 'Excellence', desc: 'Average score above 85%', icon: '📊', unlocked: avg >= 85 },
      { id: 'b6', name: 'Scholar', desc: 'Completed 5 or more quizzes', icon: '🔐', unlocked: quizHistory.length >= 5 },
      { id: 'b7', name: 'Master', desc: 'Completed 10 or more quizzes', icon: '🏗️', unlocked: quizHistory.length >= 10 }
    ])
  }, [quizHistory])
  const [leaderboardEntries, setLeaderboardEntries] = useState([])
  const [peerTradingOffers, setPeerTradingOffers] = useState([
    { id: 'p1', title: 'Share Python Notes', partner: 'H. K. Silva', reward: '3 skill points', status: 'pending' },
    { id: 'p2', title: 'Swap Database Quiz Tips', partner: 'A. Perera', reward: 'Access to SQL vault', status: 'pending' },
    { id: 'p3', title: 'Review React Project', partner: 'N. Fernando', reward: 'Code review credits', status: 'accepted' }
  ])
  const [peerLearningPeers, setPeerLearningPeers] = useState([])
  const [openPeerChatId, setOpenPeerChatId] = useState(null)
  const [peerChatMessages, setPeerChatMessages] = useState({})
  const [showChatModal, setShowChatModal] = useState(false)
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

  const isQuizCompleted = (quizId) => quizHistory.some(
    (entry) => entry.quiz_id === quizId || entry.quizId === quizId || String(entry.quiz_id) === String(quizId)
  )

  const getQuizForCourse = (courseId) => quizzes.find((q) => q.course_id === courseId || q.courseId === courseId)

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
  const upcomingQuizzes = quizzes
    .filter((q) => !isQuizCompleted(q.quiz_id || q.id))
    .sort((a, b) => (a.due_date || a.dueDate || '').localeCompare(b.due_date || b.dueDate || ''))
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

  const fetchCourses = useCallback(async () => {
    if (!student?.student_id) return
    setIsLoadingCourses(true)
    try {
      const [allRes, myRes] = await Promise.all([
        fetch('http://localhost:5000/api/course/all', { headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        fetch(`http://localhost:5000/api/student/my-courses/${student.student_id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      ])
      const allData = await allRes.json()
      const myData = await myRes.json()
      if (allData.success) {
        const enrolledIds = new Set((myData.success ? myData.courses : []).map(c => c.course_id))
        setCourses((allData.courses || []).map(c => ({
          id: String(c.course_id),
          course_id: c.course_id,
          title: c.title || c.course_title,
          description: c.description || '',
          tutor: c.instructor || 'Unknown Tutor',
          instructor: c.instructor || 'Unknown Tutor',
          enrolled: enrolledIds.has(c.course_id),
          progress: 0
        })))
      }
    } catch { /* keep empty */ }
    finally { setIsLoadingCourses(false) }
  }, [student?.student_id, token])

  const fetchAttendance = useCallback(async () => {
    if (!student?.student_id) return
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/student/${student.student_id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      if (data.success) {
        setAttendanceRecords((data.records || []).map(r => ({
          id: r.attendance_id,
          courseId: String(r.course_id),
          date: r.session_date,
          session: r.session_name || 'Session',
          status: r.status
        })))
      }
    } catch { /* keep empty */ }
  }, [student?.student_id, token])

  const fetchPlannerTasks = useCallback(async () => {
    if (!student?.student_id) return
    try {
      const res = await fetch(`http://localhost:5000/api/planner/list/${student.student_id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      if (data.success) {
        setPlannerTasks((data.tasks || []).map(t => ({
          id: t.planner_id,
          text: t.task_name,
          date: t.scheduled_date,
          completed: t.is_completed,
          isAI: t.task_type === 'ai' || t.task_type === 'ai_generated',
          originalReason: t.description || ''
        })))
      }
    } catch { /* keep empty */ }
  }, [student?.student_id, token])

  const fetchQuizzes = useCallback(async () => {
    setIsLoadingQuizzes(true)
    setQuizError(null)
    try {
      const res = await fetch('http://localhost:5000/api/quiz/all', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      if (res.ok) setQuizzes(data.quizzes || [])
      else setQuizError(data.message || 'Failed to load quizzes')
    } catch {
      setQuizError('Unable to connect to server')
    } finally {
      setIsLoadingQuizzes(false)
    }
  }, [token])

  const fetchQuizHistory = useCallback(async () => {
    if (!student?.student_id) return
    try {
      const res = await fetch(`http://localhost:5000/api/quiz/history/${student.student_id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      if (res.ok) setQuizHistory(data.results || [])
    } catch {
      // keep existing history
    }
  }, [student?.student_id, token])

  const fetchPeersAndRequests = useCallback(async () => {
    if (!student?.student_id) return
    try {
      // 1. Fetch recommendations
      const recRes = await fetch(`http://localhost:5000/api/recommendations/${student.student_id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const recommendations = recRes.ok ? (await recRes.json() || []) : []

      // 2. Fetch sent requests
      const sentRes = await fetch(`http://localhost:5000/api/skillrequests/sent/${student.student_id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const sentRequests = sentRes.ok ? (await sentRes.json() || []) : []

      // 3. Fetch incoming requests
      const incRes = await fetch(`http://localhost:5000/api/skillrequests/incoming/${student.student_id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const incomingRequests = incRes.ok ? (await incRes.json() || []) : []

      const peerMap = new Map()

      const makePeerObject = (studentId, name, expertise, field, scoreLabel, status, requestId = null, skillId = null, rating = null, alStream = null, gradeLevel = null, isSuggested = false, matchReason = null) => ({
        id: `pl-${studentId}`,
        dbStudentId: studentId,
        requestId,
        skillId,
        name: name || `Student ${studentId}`,
        expertise: expertise || 'General ICT',
        field: alStream || field || 'General',
        quizLevel: gradeLevel || 'expert',
        rating: rating !== null && rating !== undefined ? parseFloat(rating) : 0.0,
        reason: matchReason || scoreLabel || 'Suggested Partner',
        mutualInterest: `Study partner for ${expertise || 'General ICT'}`,
        status: status,
        isSuggested
      })

      recommendations.forEach(r => {
        const sid = r.student_id
        peerMap.set(sid, makePeerObject(
          sid,
          r.peer_name,
          r.can_teach,
          r.wants,
          r.score_label,
          'available',
          null,
          r.teach_skill_id,
          r.rating,
          r.al_stream,
          r.grade_level,
          r.is_suggested,
          r.reason
        ))
      })

      sentRequests.forEach(req => {
        const sid = req.provider_student_id
        let status = 'available'
        if (req.status === 'Pending') status = 'requested'
        else if (req.status === 'Accepted') status = 'connected'
        else if (req.status === 'Rejected') status = 'declined'

        if (peerMap.has(sid)) {
          const peer = peerMap.get(sid)
          peer.status = status
          peer.requestId = req.request_id
        } else {
          peerMap.set(sid, makePeerObject(
            sid,
            req.provider_name,
            req.skill_name,
            null,
            null,
            status,
            req.request_id,
            req.skill_id,
            req.rating,
            req.al_stream,
            req.grade_level
          ))
        }
      })

      incomingRequests.forEach(req => {
        const sid = req.requester_student_id
        let status = 'available'
        if (req.status === 'Pending') status = 'incoming'
        else if (req.status === 'Accepted') status = 'connected'
        else if (req.status === 'Rejected') status = 'declined'

        if (peerMap.has(sid)) {
          const peer = peerMap.get(sid)
          peer.status = status
          peer.requestId = req.request_id
        } else {
          peerMap.set(sid, makePeerObject(
            sid,
            req.requester_name,
            req.skill_name,
            null,
            null,
            status,
            req.request_id,
            req.skill_id,
            req.rating,
            req.al_stream,
            req.grade_level
          ))
        }
      })

      setPeerLearningPeers(Array.from(peerMap.values()))

      // Generate request notifications dynamically from database requests
      const requestNotifications = []
      incomingRequests.forEach(req => {
        if (req.status === 'Pending') {
          requestNotifications.push({
            id: `req-${req.request_id}`,
            text: `New peer learning request from ${req.requester_name} to learn ${req.skill_name}.`,
            unread: true
          })
        }
      })
      sentRequests.forEach(req => {
        if (req.status === 'Accepted') {
          requestNotifications.push({
            id: `acc-${req.request_id}`,
            text: `${req.provider_name} accepted your study request to learn ${req.skill_name}!`,
            unread: true
          })
        }
      })

      setNotifications(prev => {
        const staticNotifications = prev.filter(n => typeof n.id === 'number' || (!n.id.startsWith('req-') && !n.id.startsWith('acc-')))
        const merged = [...requestNotifications.map(newN => {
          const existing = prev.find(oldN => oldN.id === newN.id)
          return existing ? { ...newN, unread: existing.unread } : newN
        }), ...staticNotifications]
        return merged
      })
    } catch (e) {
      console.error("Error fetching peer community:", e)
    }
  }, [student?.student_id, token])

  const peerLearningPeersRef = useRef([])
  useEffect(() => {
    peerLearningPeersRef.current = peerLearningPeers
  }, [peerLearningPeers])

  // Polling chat messages for all connected peers
  useEffect(() => {
    let active = true
    const checkAllMessages = async () => {
      const connectedPeers = peerLearningPeersRef.current.filter(p => p.status === 'connected')
      for (const peer of connectedPeers) {
        if (!peer.requestId) continue
        try {
          const res = await fetch(`http://localhost:5000/api/skillmessages/${peer.requestId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
          if (res.ok && active) {
            const msgs = await res.json()
            const peerId = peer.id

            setPeerChatMessages(prev => {
              const oldMsgs = prev[peerId] || []
              const oldIds = new Set(oldMsgs.map(m => String(m.id)))
              
              let hasNew = false
              const parsedMsgs = msgs.map(m => {
                const msgId = String(m.message_id)
                if (!oldIds.has(msgId)) {
                  if (m.sender_id !== student?.student_id) {
                    hasNew = true
                    
                    // Add to notifications if not already there
                    setNotifications(prevNotif => {
                      if (prevNotif.some(n => n.id === `msg-${msgId}`)) return prevNotif
                      const snippet = m.message.slice(0, 30) + (m.message.length > 30 ? '...' : '')
                      return [
                        {
                          id: `msg-${msgId}`,
                          text: `New chat message from ${peer.name}: "${snippet}"`,
                          unread: true
                        },
                        ...prevNotif
                      ]
                    })
                  }
                }

                let timeStr = '10:00 AM'
                try {
                  if (m.sent_at) {
                    const dateObj = new Date(m.sent_at)
                    if (!isNaN(dateObj.getTime())) {
                      timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  }
                } catch {}
                
                let msgType = 'text'
                let fileInfo = {}
                if (m.message?.startsWith('📎 Shared file:')) {
                  msgType = 'attachment'
                  const fileName = m.message.replace('📎 Shared file:', '').trim()
                  fileInfo = {
                    fileName,
                    fileType: fileName.endsWith('.pdf') ? 'application/pdf' : fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileName.endsWith('.webm') ? 'audio/mpeg' : 'image/png',
                    file: new Blob([`Dummy file content: ${fileName}`], { type: 'text/plain' })
                  }
                }

                return {
                  id: msgId,
                  sender: m.sender_id === student?.student_id ? 'me' : 'peer',
                  type: msgType,
                  content: m.message,
                  time: timeStr,
                  ...fileInfo
                }
              })

              if (parsedMsgs.length === oldMsgs.length) {
                return prev
              }

              // If there is a new incoming message and it's not the currently open chat screen, set unread indicator
              if (hasNew && (openPeerChatId !== peerId || !showChatModal)) {
                setPeerLearningPeers(prevPeers => prevPeers.map(p => 
                  p.id === peerId ? { ...p, hasUnreadMessage: true } : p
                ))
              }

              return {
                ...prev,
                [peerId]: parsedMsgs
              }
            })
          }
        } catch (err) {
          console.error("Error polling peer chat messages:", err)
        }
      }
    }

    checkAllMessages()
    const interval = setInterval(checkAllMessages, 4000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [openPeerChatId, showChatModal, student?.student_id, token])

  // Clear unread message badge when chat is opened for a specific peer
  useEffect(() => {
    if (openPeerChatId && showChatModal) {
      setPeerLearningPeers(prev => prev.map(p => 
        p.id === openPeerChatId ? { ...p, hasUnreadMessage: false } : p
      ))
    }
  }, [openPeerChatId, showChatModal])

  useEffect(() => {
    if (!student?.student_id) return
    fetchCourses()
    fetchAttendance()
    fetchPlannerTasks()
    fetchQuizzes()
    fetchQuizHistory()
    fetchPeersAndRequests()
  }, [student?.student_id, fetchCourses, fetchAttendance, fetchPlannerTasks, fetchQuizzes, fetchQuizHistory, fetchPeersAndRequests])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/quiz/leaderboard')
      const data = await res.json()
      if (res.ok && data.success && data.leaderboard?.length > 0) {
        setLeaderboardEntries(data.leaderboard.map(e => ({
          indexNo: `ID-${e.student_id}`,
          name: e.name,
          points: e.points,
          emoji: '🎯',
          badges: 0,
          rankTitle: e.points >= 1500 ? 'Code Titan' : e.points >= 1100 ? 'Code Champion' : e.points >= 800 ? 'Rising Coder' : 'Code Cadet',
          rank: e.rank
        })))
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
    }
  }, [])

  const handleQuizSubmitted = () => {
    fetchQuizzes()
    fetchQuizHistory()
    fetchLeaderboard()
    fetchPeersAndRequests()
  }

  useEffect(() => {
    const myEntry = leaderboardEntries.find(e => e.indexNo === `ID-${student?.student_id}`)
    if (myEntry?.points !== undefined) setPoints(myEntry.points)
  }, [leaderboardEntries, student?.student_id])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard, student?.student_id])

  const leaderboardRank = leaderboardEntries.find((e) => e.indexNo === `ID-${student?.student_id}`)?.rank ?? '-'

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
      classrooms: STUDENT_ROUTES.course(selectedClassroomCourse || courses.find(c => c.enrolled)?.id || courses[0]?.id || '1'),
      library: STUDENT_ROUTES.courses
    }
    navigate(routeMap[path] || path)
    if (path === 'quizzes') setActiveQuizState('list')
  }

  const getAISuggestions = () => {
    const suggestions = []
    courses.forEach(c => {
      const cid = String(c.id || c.course_id)
      const feedback = confusionFeedbacks[cid]
      if (feedback === 'Confused' || feedback === 'Partially Understood') {
        suggestions.push({
          topic: c.title?.split('(')[0].trim() || c.title,
          reason: `Flagged as ${feedback}`,
          recommendation: `Review the latest lesson materials for ${c.title?.split('(')[0].trim() || c.title} and practice exercises.`,
          actionTask: `Review ${c.title?.split('(')[0].trim() || c.title}`
        })
      }
    })
    const lowScores = quizHistory.filter(h => (h.percentage || 0) < 70)
    if (lowScores.length > 0) {
      suggestions.push({
        topic: 'Quiz Performance Improvement',
        reason: 'Recent quiz score below 70%',
        recommendation: 'Review the relevant course material and retry the quiz.',
        actionTask: 'Practice quiz for weak areas'
      })
    }
    return suggestions
  }

  const handleAddRecommendationToPlanner = async (rec) => {
    const taskText = `AI Task: ${rec.actionTask}`
    if (plannerTasks.some(t => t.text === taskText || t.text === rec.actionTask)) {
      triggerToast('Already scheduled in your active agenda.')
      return
    }
    if (!student?.student_id) { triggerToast('Please log in first.'); return }
    try {
      const res = await fetch('http://localhost:5000/api/planner/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ student_id: student.student_id, task_name: taskText, scheduled_date: new Date().toISOString().split('T')[0], task_type: 'ai', description: rec.reason })
      })
      const data = await res.json()
      if (data.success && data.task) {
        const t = data.task
        setPlannerTasks(prev => [{ id: t.planner_id, text: t.task_name, date: t.scheduled_date, completed: t.is_completed, isAI: true, originalReason: rec.reason }, ...prev])
        triggerToast('AI generated task injected successfully!')
      }
    } catch { triggerToast('Unable to connect to server.') }
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

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    if (!student?.student_id) { triggerToast('Please log in first.'); return }
    try {
      const res = await fetch('http://localhost:5000/api/planner/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ student_id: student.student_id, task_name: newTaskText, scheduled_date: newTaskDate || new Date().toISOString().split('T')[0], task_type: 'study' })
      })
      const data = await res.json()
      if (data.success && data.task) {
        const t = data.task
        setPlannerTasks(prev => [{ id: t.planner_id, text: t.task_name, date: t.scheduled_date, completed: t.is_completed, isAI: false }, ...prev])
        setNewTaskText('')
        setNewTaskDate('')
        triggerToast('New goal successfully added to your planner!')
      } else { triggerToast(data.message || 'Failed to add task.') }
    } catch { triggerToast('Unable to connect to server.') }
  }

  const handleToggleTask = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/planner/toggle/${taskId}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      if (data.success && data.task) {
        setPlannerTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: data.task.is_completed } : t))
        triggerToast('Updated plan checkpoint state!')
      }
    } catch { /* silently keep local state */ }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/planner/delete/${taskId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      if (data.success) {
        setPlannerTasks(prev => prev.filter(t => t.id !== taskId))
        triggerToast('Goal removed from scheduling matrix.')
      }
    } catch { triggerToast('Unable to connect to server.') }
  }

  const handleEditTask = async (taskId, updates) => {
    const payload = {}
    if (updates.text !== undefined) payload.task_name = updates.text
    if (updates.date !== undefined) payload.scheduled_date = updates.date
    if (updates.completed !== undefined) payload.is_completed = updates.completed
    try {
      const res = await fetch(`http://localhost:5000/api/planner/update/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        setPlannerTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))
        triggerToast('Task updated successfully!')
      }
    } catch { triggerToast('Unable to connect to server.') }
  }

  const handleEnrollCourse = async (courseId) => {
    if (!student?.student_id) { triggerToast('Please log in to enroll.'); return }
    try {
      const res = await fetch('http://localhost:5000/api/course/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ student_id: student.student_id, course_id: Number(courseId) })
      })
      const data = await res.json()
      if (data.success) {
        setCourses(prev => prev.map(c => String(c.id) === String(courseId) || String(c.course_id) === String(courseId) ? { ...c, enrolled: true } : c))
        triggerToast('Course enrollment successfully recorded.')
      } else { triggerToast(data.message || 'Enrollment failed.') }
    } catch { triggerToast('Unable to connect to server.') }
  }

  const handleStartQuiz = (quiz) => {
    setActiveQuizObj(quiz)
    setCurrentQuizQuestionIndex(0)
    setQuizSelectedAnswers({})
    setActiveQuizState('active')
  }

  const handleStartQuizFromClassroom = (quiz) => {
    handleStartQuiz(quiz)
    navigate(STUDENT_ROUTES.quiz(quiz.quiz_id || quiz.id))
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
    courses.forEach(c => {
      const cid = String(c.id || c.course_id)
      const feedback = confusionFeedbacks[cid]
      if (feedback === 'Partially Understood' || feedback === 'Confused' || (c.progress || 0) < 70) {
        weaknesses.push(c.title?.split('(')[0].trim() || c.title)
      }
    })
    return weaknesses.length > 0 ? weaknesses.join(', ') : 'No strong weakness detected yet. Keep learning!'
  }

  const handleSendPeerRequest = async (peerId) => {
    const peer = peerLearningPeers.find((p) => p.id === peerId)
    if (!peer || !student?.student_id) return

    try {
      const res = await fetch('http://localhost:5000/api/skillrequests/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          requester_student_id: student.student_id,
          provider_student_id: peer.dbStudentId,
          skill_id: peer.skillId || 1
        })
      })
      if (res.ok) {
        triggerToast('Peer request sent. Waiting for the other party to accept.')
        fetchPeersAndRequests()
      } else {
        triggerToast('Failed to send peer request.')
      }
    } catch {
      triggerToast('Unable to connect to server.')
    }
  }

  const handlePeerAcceptedConnection = async (peerId) => {
    const peer = peerLearningPeers.find((p) => p.id === peerId)
    if (!peer || !peer.requestId) return

    try {
      const res = await fetch(`http://localhost:5000/api/skillrequests/accept/${peer.requestId}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) {
        triggerToast(`You accepted ${peer.name}'s request. Chat is now open.`)
        fetchPeersAndRequests()
      } else {
        triggerToast('Failed to accept request.')
      }
    } catch {
      triggerToast('Unable to connect to server.')
    }
  }

  const handlePeerDeclineConnection = async (peerId) => {
    const peer = peerLearningPeers.find((p) => p.id === peerId)
    if (!peer || !peer.requestId) return

    try {
      const res = await fetch(`http://localhost:5000/api/skillrequests/reject/${peer.requestId}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) {
        triggerToast(`You declined ${peer.name}'s request.`)
        fetchPeersAndRequests()
      } else {
        triggerToast('Failed to decline request.')
      }
    } catch {
      triggerToast('Unable to connect to server.')
    }
  }

  const handlePeerAcceptedByOther = (peerId) => {
    fetchPeersAndRequests()
  }

  const handleEndPeerConnection = async (peerId) => {
    const peer = peerLearningPeers.find(p => p.id === peerId)
    if (!peer || !peer.requestId) return

    try {
      const res = await fetch(`http://localhost:5000/api/skillrequests/reject/${peer.requestId}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) {
        triggerToast(`Ended connection with ${peer.name}.`)
        setOpenPeerChatId(null)
        fetchPeersAndRequests()
      } else {
        triggerToast('Failed to end connection.')
      }
    } catch {
      triggerToast('Unable to connect to server.')
    }
  }

  const handleSendPeerChatMessage = async (peerId, message) => {
    const peer = peerLearningPeers.find(p => p.id === peerId)
    if (!peer || !peer.requestId || !student?.student_id) return

    try {
      const res = await fetch('http://localhost:5000/api/skillmessages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          request_id: peer.requestId,
          sender_id: student.student_id,
          receiver_id: peer.dbStudentId,
          message: message.content
        })
      })
      if (res.ok) {
        const data = await res.json()
        setPeerChatMessages(prev => ({
          ...prev,
          [peerId]: [
            ...(prev[peerId] || []),
            {
              id: String(data.message_id),
              sender: 'me',
              type: 'text',
              content: data.message,
              time: message.time
            }
          ]
        }))
      }
    } catch (e) {
      console.error("Error sending message:", e)
    }
  }

  const handleSendPeerAttachment = async (peerId, file) => {
    if (!file) return
    const peer = peerLearningPeers.find(p => p.id === peerId)
    if (!peer || !peer.requestId || !student?.student_id) return

    try {
      const messageText = `📎 Shared file: ${file.name}`
      const res = await fetch('http://localhost:5000/api/skillmessages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          request_id: peer.requestId,
          sender_id: student.student_id,
          receiver_id: peer.dbStudentId,
          message: messageText
        })
      })
      if (res.ok) {
        triggerToast(`${file.name} shared in chat.`)
      }
    } catch (e) {
      console.error("Error sending attachment:", e)
    }
  }

  const handleDownloadResource = (resource, course) => {
    const resourceName = resource.title || resource.name || 'material'
    const content = `EduMate Learning Material\nCourse: ${course.course_id || course.id} - ${course.title}\nResource: ${resourceName}\nTutor: ${course.tutor || course.instructor || 'Unknown'}\n\n--- Downloaded from EduMate LMS ---`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = resourceName.replace(/\s+/g, '_').replace(/[()]/g, '')
    link.click()
    URL.revokeObjectURL(url)
    triggerToast(`Downloaded ${resourceName}`)
  }

  const handleGenerateSchedule = async () => {
    if (!student?.student_id) { triggerToast('Please log in first.'); return }
    const today = new Date()
    const enrolled = courses.filter((c) => c.enrolled)
    const existingTexts = new Set(plannerTasks.map((t) => t.text))
    const generated = []

    enrolled.forEach((course, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() + i + 1)
      generated.push({ task_name: `AI Schedule: Review ${course.title.split('(')[0].trim()} modules`, scheduled_date: date.toISOString().split('T')[0], task_type: 'ai', description: 'Generated from course progress analytics' })
    })

    courses.forEach(c => {
      const cid = String(c.id || c.course_id)
      if (confusionFeedbacks[cid] === 'Confused' || confusionFeedbacks[cid] === 'Partially Understood') {
        const date = new Date(today)
        date.setDate(date.getDate() + 2)
        generated.push({ task_name: `AI Schedule: Practice weak area — ${c.title?.split('(')[0].trim()}`, scheduled_date: date.toISOString().split('T')[0], task_type: 'ai', description: `Triggered by confusion feedback on ${c.title}` })
      }
    })

    const quizDate = new Date(today)
    quizDate.setDate(quizDate.getDate() + 3)
    generated.push({ task_name: 'AI Schedule: Attempt recommended quiz for weak areas', scheduled_date: quizDate.toISOString().split('T')[0], task_type: 'ai', description: 'Rule-based recommendation system' })

    const toAdd = generated.filter(t => !existingTexts.has(t.task_name))
    if (toAdd.length === 0) { triggerToast('Your study schedule is already up to date.'); return }

    let added = 0
    for (const taskData of toAdd) {
      try {
        const res = await fetch('http://localhost:5000/api/planner/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ student_id: student.student_id, ...taskData })
        })
        const data = await res.json()
        if (data.success && data.task) {
          const t = data.task
          setPlannerTasks(prev => [{ id: t.planner_id, text: t.task_name, date: t.scheduled_date, completed: false, isAI: true, originalReason: taskData.description }, ...prev])
          added++
        }
      } catch { /* skip */ }
    }
    triggerToast(added > 0 ? `Generated ${added} AI study tasks for the week!` : 'Unable to generate tasks right now.')
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
      showChatModal={showChatModal}
      setShowChatModal={setShowChatModal}
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
          <button className="logout-pill" type="button" onClick={() => setShowLogoutConfirm(true)}>
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
            <button className="logout-pill" type="button" onClick={() => setShowLogoutConfirm(true)}>
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
              <QuizListPage mockQuizzes={quizzes} isQuizCompleted={isQuizCompleted} adaptiveDifficulty={getAdaptiveDifficulty()} isLoading={isLoadingQuizzes} error={quizError} />
            )} />
            <Route path="/quiz/:id" element={(
              <QuizAttemptPage
                student={student}
                token={token}
                onQuizSubmitted={handleQuizSubmitted}
                triggerToast={triggerToast}
              />
            )} />
            <Route path="/result/:id" element={(
              <QuizResultPage quizHistory={quizHistory} mockQuizzes={quizzes} />
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
              <ProfilePage studentProfile={studentProfile} setStudentProfile={setStudentProfile} points={points} badges={badges} triggerToast={triggerToast} student={student} token={token} />
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

      <ConfirmationModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Log Out?"
        message="Are you sure you want to log out of your student portal?"
        confirmText="Log Out"
        onConfirm={onLogout}
        type="logout"
      />
    </div>
  )
}
