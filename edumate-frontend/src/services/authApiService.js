const API_BASE_URL = "http://localhost:5000/api/auth";
const TUTOR_SESSION_KEY = "tutorSession";

export const login = async ({ role, email, password }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: role.toLowerCase(),
        username: email.trim(),
        password,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error during login:", error);
    return { success: false, message: "Failed to connect to login service" };
  }
};

export const saveTutorSession = (tutor) => {
  localStorage.setItem(TUTOR_SESSION_KEY, JSON.stringify(tutor));
};

export const getTutorSession = () => {
  try {
    const raw = localStorage.getItem(TUTOR_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearTutorSession = () => {
  localStorage.removeItem(TUTOR_SESSION_KEY);
};

export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: "Password is required" };
  }

  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must include at least one uppercase letter" };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must include at least one lowercase letter" };
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: "Password must include at least one number" };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return { valid: false, message: "Password must include at least one special character" };
  }

  return { valid: true, message: "Password is valid" };
};
