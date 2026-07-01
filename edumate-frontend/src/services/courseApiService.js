const API_BASE_URL = "http://localhost:5000/api/tutor/courses";

export const getMaterialFileUrl = (filename) =>
  `${API_BASE_URL}/files/${encodeURIComponent(filename)}`;

// ==================== COURSE MANAGEMENT ====================

export const getAllCourses = async (tutorId = null, page = 1, perPage = 100) => {
  try {
    const params = new URLSearchParams();
    if (tutorId) params.append("tutor_id", tutorId);
    params.append("page", page);
    params.append("per_page", perPage);

    const response = await fetch(`${API_BASE_URL}/?${params}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { success: false, message: "Failed to fetch courses" };
  }
};

export const getCourse = async (courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${courseId}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching course:", error);
    return { success: false, message: "Failed to fetch course" };
  }
};

export const createCourse = async (courseData) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating course:", error);
    return { success: false, message: "Failed to create course" };
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${courseId}`, {
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

export const uploadCourseCover = async (courseId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/${courseId}/cover`, {
      method: "POST",
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error("Error uploading course cover:", error);
    return { success: false, message: "Failed to upload cover image" };
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${courseId}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting course:", error);
    return { success: false, message: "Failed to delete course" };
  }
};

// ==================== COURSE MATERIALS ====================

export const getCourseMaterials = async (courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${courseId}/materials`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching materials:", error);
    return { success: false, message: "Failed to fetch materials" };
  }
};

export const getMaterial = async (materialId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/materials/${materialId}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching material:", error);
    return { success: false, message: "Failed to fetch material" };
  }
};

export const addMaterial = async (courseId, file, title, materialType, description = "") => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("material_type", materialType);
    formData.append("description", description);

    const response = await fetch(`${API_BASE_URL}/${courseId}/materials`, {
      method: "POST",
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding material:", error);
    return { success: false, message: "Failed to add material" };
  }
};

export const updateMaterial = async (materialId, materialData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/materials/${materialId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(materialData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating material:", error);
    return { success: false, message: "Failed to update material" };
  }
};

export const deleteMaterial = async (materialId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/materials/${materialId}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting material:", error);
    return { success: false, message: "Failed to delete material" };
  }
};

export const bulkUploadMaterials = async (courseId, files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${API_BASE_URL}/${courseId}/bulk-upload`, {
      method: "POST",
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error("Error bulk uploading materials:", error);
    return { success: false, message: "Failed to upload materials" };
  }
};

// ==================== COURSE STATISTICS ====================

export const getCourseStats = async (courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${courseId}/stats`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching course stats:", error);
    return { success: false, message: "Failed to fetch statistics" };
  }
};

export const enrollStudent = async (courseId, studentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${courseId}/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: studentId,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error enrolling student:", error);
    return { success: false, message: "Failed to enroll student" };
  }
};
