export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function adminFetch(url, options = {}) {
  const token = localStorage.getItem('edumate_admin_token')
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
  return fetch(url, { ...options, headers })
}
