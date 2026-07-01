const API_BASE_URL = "http://localhost:5000/api/course";

export const getAllCourses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/all`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { success: false, message: "Failed to fetch courses" };
  }
};

export const getCourse = async (courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${courseId}`);
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating course:", error);
    return { success: false, message: "Failed to update course" };
  }
};

export const addMaterial = async (courseId, formData) => {
  try {
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

export const uploadCourseCover = async (courseId, formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${courseId}/cover`, {
      method: "POST",
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error("Error uploading cover:", error);
    return { success: false, message: "Failed to upload cover" };
  }
};

export const getMaterialFileUrl = (filename) => `${API_BASE_URL}/files/${encodeURIComponent(filename)}`;
