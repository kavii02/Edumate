const API_BASE = "http://localhost:5000/api/tutor";
const COURSE_API = "http://localhost:5000/api/courses";
const AI_API = "http://localhost:5000/api/ai";

// ==================== PROFILE ====================

export const getTutorProfile = async (tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/profile/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch profile" };
  }
};

export const updateTutorProfile = async (tutorId, profileData) => {
  try {
    const res = await fetch(`${API_BASE}/profile/${tutorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to update profile" };
  }
};

export const changePassword = async (tutorId, oldPassword, newPassword) => {
  try {
    const res = await fetch(`${API_BASE}/change-password/${tutorId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to change password" };
  }
};

// ==================== DASHBOARD ====================

export const getDashboardStats = async (tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/dashboard/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch dashboard stats" };
  }
};

// ==================== COURSES ====================

/** Get all courses for this tutor (with enrollment/quiz counts) */
export const getTutorCourses = async (tutorId) => {
  try {
    const res = await fetch(`${COURSE_API}/?tutor_id=${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch courses" };
  }
};

/** Get a single course by ID */
export const getCourseDetails = async (courseId) => {
  try {
    const res = await fetch(`${COURSE_API}/${courseId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch course details" };
  }
};

/** Create a new course */
export const createCourse = async (tutorId, courseData) => {
  try {
    const res = await fetch(`${COURSE_API}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutor_id: tutorId, ...courseData }),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to create course" };
  }
};

/** Update a course */
export const updateCourse = async (courseId, courseData) => {
  try {
    const res = await fetch(`${COURSE_API}/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseData),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to update course" };
  }
};

/** Delete a course */
export const deleteCourse = async (courseId) => {
  try {
    const res = await fetch(`${COURSE_API}/${courseId}`, { method: "DELETE" });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to delete course" };
  }
};

// ==================== COURSE MATERIALS ====================

export const getCourseDetailMaterials = async (courseId) => {
  try {
    const res = await fetch(`${COURSE_API}/${courseId}/materials`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch materials" };
  }
};

export const addCourseMaterial = async (courseId, materialData) => {
  try {
    const res = await fetch(`${COURSE_API}/${courseId}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materialData),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to add course material" };
  }
};

export const deleteCourseMaterial = async (materialId) => {
  try {
    const res = await fetch(`${COURSE_API}/materials/${materialId}`, { method: "DELETE" });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to delete course material" };
  }
};

// ==================== QUIZZES ====================

/** Get all quizzes for this tutor (with attempt counts) */
export const getTutorQuizzes = async (tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/quizzes/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch quizzes" };
  }
};

/** Create a quiz (with questions) */
export const createQuiz = async (tutorId, quizData) => {
  try {
    const res = await fetch(`${API_BASE}/quizzes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutor_id: tutorId, ...quizData }),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to create quiz" };
  }
};

/** Get full quiz detail (with questions and attempt stats) */
export const getQuizDetails = async (quizId) => {
  try {
    const res = await fetch(`${API_BASE}/quiz/${quizId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch quiz details" };
  }
};

/** Get all student results for a quiz */
export const getQuizResults = async (quizId) => {
  try {
    const res = await fetch(`${API_BASE}/quiz/${quizId}/results`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch quiz results" };
  }
};

/** Publish a quiz */
export const publishQuiz = async (quizId) => {
  try {
    const res = await fetch(`${API_BASE}/quizzes/${quizId}/publish`, { method: "PUT" });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to publish quiz" };
  }
};

/** Update an existing quiz (title, difficulty, duration, status) */
export const updateQuiz = async (quizId, quizData) => {
  try {
    const res = await fetch(`${API_BASE}/quiz/${quizId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quizData),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to update quiz" };
  }
};

/** Add a single question to an existing quiz */
export const addQuestion = async (quizId, questionData) => {
  try {
    const res = await fetch(`${API_BASE}/quiz/${quizId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz_id: quizId, ...questionData }),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to add question" };
  }
};

/** Delete a single question */
export const deleteQuestion = async (questionId) => {
  try {
    const res = await fetch(`${API_BASE}/question/${questionId}`, { method: "DELETE" });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to delete question" };
  }
};


// ==================== STUDENT MONITORING ====================

/** All students enrolled across this tutor's courses with real performance data */
export const getTutorStudents = async (tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/students/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch students" };
  }
};

/** Detailed view for a single student */
export const getStudentDetail = async (studentId, tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/student/${studentId}/detail/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch student detail" };
  }
};

/** Students in a specific course with their quiz/attendance stats */
export const getCourseStudents = async (courseId) => {
  try {
    const res = await fetch(`${API_BASE}/course/${courseId}/students`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch course students" };
  }
};

// ==================== ATTENDANCE ====================

/** Attendance summary across all tutor's courses */
export const getTutorAttendance = async (tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/attendance/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch attendance" };
  }
};

/** Detailed per-student attendance for a course */
export const getCourseAttendanceDetail = async (courseId) => {
  try {
    const res = await fetch(`${API_BASE}/attendance/course/${courseId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch course attendance" };
  }
};

/** Mark attendance for a student */
export const markAttendance = async (attendanceData) => {
  try {
    const res = await fetch(`${API_BASE}/attendance/mark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attendanceData),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to mark attendance" };
  }
};

// ==================== ANALYTICS ====================

/** Full analytics for this tutor's courses */
export const getTutorAnalytics = async (tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/analytics/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch analytics" };
  }
};

// ==================== AI RISK PREDICTION ====================

/** Get AI model status */
export const getAIStatus = async () => {
  try {
    const res = await fetch(`${AI_API}/status`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch AI status" };
  }
};

/** Train the AI model */
export const trainAIModel = async () => {
  try {
    const res = await fetch(`${AI_API}/train`, { method: "POST" });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to train model" };
  }
};

/** Predict risk for all students */
export const predictAllStudents = async (tutorId) => {
  try {
    const query = tutorId ? `?tutor_id=${tutorId}` : "";
    const res = await fetch(`${AI_API}/predict-all${query}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch predictions" };
  }
};

/** Predict risk for one student */
export const predictStudent = async (studentId) => {
  try {
    const res = await fetch(`${AI_API}/predict/${studentId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to predict student risk" };
  }
};

// ==================== AVAILABILITY ====================

export const getTutorAvailability = async (tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/availability/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch availability" };
  }
};

export const addAvailability = async (tutorId, availabilityData) => {
  try {
    const res = await fetch(`${API_BASE}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutor_id: tutorId, ...availabilityData }),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to add availability" };
  }
};

export const deleteAvailability = async (availabilityId) => {
  try {
    const res = await fetch(`${API_BASE}/availability/${availabilityId}`, { method: "DELETE" });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to delete availability" };
  }
};

/** AI quiz generation from PDF */
export const generateQuizFromPdf = async (pdfFile, numberOfQuestions, difficulty) => {
  try {
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("number_of_questions", numberOfQuestions);
    formData.append("difficulty", difficulty);
    const res = await fetch("http://localhost:5000/api/quiz/generate-from-pdf", {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to generate quiz from PDF" };
  }
};

/** Delete a quiz */
export const deleteQuiz = async (quizId) => {
  try {
    const res = await fetch(`${API_BASE}/quiz/${quizId}`, { method: "DELETE" });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to delete quiz" };
  }
};

/** Update a single quiz question */
export const updateQuestion = async (questionId, questionData) => {
  try {
    const res = await fetch(`${API_BASE}/question/${questionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionData),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to update question" };
  }
};

// ==================== ANNOUNCEMENTS ====================

/** Get all announcements for this tutor */
export const getAnnouncements = async (tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/announcements/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch announcements" };
  }
};

/** Create an announcement */
export const createAnnouncement = async (tutorId, data) => {
  try {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tutor_id: tutorId, ...data }),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to create announcement" };
  }
};

/** Update an existing announcement */
export const updateAnnouncement = async (announcementId, data) => {
  try {
    const res = await fetch(`${API_BASE}/announcements/${announcementId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to update announcement" };
  }
};

/** Delete an announcement */
export const deleteAnnouncement = async (announcementId) => {
  try {
    const res = await fetch(`${API_BASE}/announcements/${announcementId}`, { method: "DELETE" });
    return await res.json();
  } catch {
    return { success: false, message: "Failed to delete announcement" };
  }
};

/** Get recent announcements for dashboard */
export const getRecentAnnouncements = async (tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/recent-announcements/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch recent announcements" };
  }
};

// ==================== TOPIC DIFFICULTY ====================

/** Get topic difficulty data from topic_difficulty table */
export const getTopicDifficulty = async (tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/topic-difficulty/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch topic difficulty" };
  }
};

// ==================== PERFORMANCE SUMMARY ====================

/** Get student_performance records for this tutor's students */
export const getPerformanceSummary = async (tutorId) => {
  try {
    const res = await fetch(`${API_BASE}/performance-summary/${tutorId}`);
    return await res.json();
  } catch {
    return { success: false, message: "Failed to fetch performance summary" };
  }
};

