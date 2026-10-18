// Base API endpoint for the backend server
// Defaults to http://localhost:5000/api or relative /api through Vite proxy
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
/**
 * Helper to handle fetch calls and server down errors gracefully
 */
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data = {};
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || `HTTP error ${response.status}` };
    }

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If the browser failed to connect (e.g., backend server not running)
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Server is unreachable. Please verify that the backend is running on http://localhost:5000'
      );
    }
    throw err;
  }
}

/**
 * Upload resume PDF file for text extraction and AI scoring
 * @param {File} file - PDF file from file input or drag-and-drop
 */
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);

  return await apiFetch('/resume/upload', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Generate 10 personalized interview questions for the given resume
 * @param {string} resumeId - MongoDB ObjectId of the uploaded resume
 */
export async function startInterview(resumeId) {
  return await apiFetch('/interview/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId }),
  });
}

/**
 * Submit answers for evaluation and score calculation
 * @param {string} interviewId - MongoDB ObjectId of the interview session
 * @param {Array<{questionId: number, userAnswer: string}>} answers - Candidate answers
 */
export async function submitInterview(interviewId, answers) {
  return await apiFetch('/interview/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interviewId, answers }),
  });
}

/**
 * Retrieve past resume analyses and interview sessions
 */
export async function getHistory() {
  return await apiFetch('/history', {
    method: 'GET',
  });
}
