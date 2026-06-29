const API_BASE_URL = "http://localhost:5000/api/tutor";
const COURSE_API_BASE_URL = "http://localhost:5000/api/courses";

// ==================== PROFILE ====================

export const getTutorProfile = async (tutorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${tutorId}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching tutor profile:", error);
    return { success: false, message: "Failed to fetch profile" };
  }
};

export const updateTutorProfile = async (tutorId, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${tutorId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating tutor profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
};

export const changePassword = async (tutorId, oldPassword, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/change-password/${tutorId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: "Failed to change password" };
  }
};

// ==================== DASHBOARD ====================

export const getDashboardStats = async (tutorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/${tutorId}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, message: "Failed to fetch dashboard stats" };
  }
};

// ==================== COURSES ====================

export const getTutorCourses = async (tutorId) => {
  try {
    const response = await fetch(`${COURSE_API_BASE_URL}/?tutor_id=${tutorId}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { success: false, message: "Failed to fetch courses" };
  }
};

export const createCourse = async (tutorId, courseData) => {
  try {
    const response = await fetch(`${COURSE_API_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tutor_id: tutorId,
        ...courseData,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating course:", error);
    return { success: false, message: "Failed to create course" };
  }
};

export const getCourseDetails = async (courseId) => {
  try {
    const response = await fetch(`${COURSE_API_BASE_URL}/${courseId}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching course details:", error);
    return { success: false, message: "Failed to fetch course details" };
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await fetch(`${COURSE_API_BASE_URL}/${courseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating course:", error);
    return { success: false, message: "Failed to update course" };
  }
};

// ==================== COURSE MATERIALS ====================

export const addCourseMaterial = async (courseId, file, title, materialType, description = "") => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("material_type", materialType);
    formData.append("description", description);

    const response = await fetch(`${COURSE_API_BASE_URL}/${courseId}/materials`, {
      method: "POST",
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding course material:", error);
    return { success: false, message: "Failed to add course material" };
  }
};

export const deleteCourseMaterial = async (materialId) => {
  try {
    const response = await fetch(`${COURSE_API_BASE_URL}/materials/${materialId}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting course material:", error);
    return { success: false, message: "Failed to delete course material" };
  }
};

// ==================== QUIZZES ====================

export const getTutorQuizzes = async (tutorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/${tutorId}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return { success: false, message: "Failed to fetch quizzes" };
  }
};

export const createQuiz = async (tutorId, quizData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tutor_id: tutorId,
        ...quizData,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating quiz:", error);
    return { success: false, message: "Failed to create quiz" };
  }
};

export const getQuizDetails = async (quizId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    return { success: false, message: "Failed to fetch quiz details" };
  }
};

export const publishQuiz = async (quizId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/publish`, {
      method: "PUT",
    });
    return await response.json();
  } catch (error) {
    console.error("Error publishing quiz:", error);
    return { success: false, message: "Failed to publish quiz" };
  }
};

// ==================== QUESTIONS ====================

export const addQuestion = async (quizId, questionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quiz_id: quizId,
        ...questionData,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding question:", error);
    return { success: false, message: "Failed to add question" };
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting question:", error);
    return { success: false, message: "Failed to delete question" };
  }
};

// ==================== AVAILABILITY ====================

export const getTutorAvailability = async (tutorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/availability/${tutorId}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching availability:", error);
    return { success: false, message: "Failed to fetch availability" };
  }
};

export const addAvailability = async (tutorId, availabilityData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tutor_id: tutorId,
        ...availabilityData,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding availability:", error);
    return { success: false, message: "Failed to add availability" };
  }
};

export const deleteAvailability = async (availabilityId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/availability/${availabilityId}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting availability:", error);
    return { success: false, message: "Failed to delete availability" };
  }
};
