const SERVER_URL = "http://localhost:3001";

const login = async (credentials) => {
  const response = await fetch(`${SERVER_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

const getUser = async () => {
  const response = await fetch(`${SERVER_URL}/api/sessions/current`, {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};

const logout = async() => {
  const response = await fetch(`${SERVER_URL}/api/sessions/current`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}

// GET /api/students
const getStudentsList = async () => {
  const response = await fetch(`${SERVER_URL}/api/students`, {
    credentials: 'include'
  });

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error("Failed to fetch students.");
  }
};

// POST /api/assignments
const createAssignment = async ({ question, studentIds }) => {
  const response = await fetch(`${SERVER_URL}/api/assignments`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ question, studentIds })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to create assignment.");
  }
};

// GET /api/assignments
const getEvaluableAssignments = async () => {
  const response = await fetch(`${SERVER_URL}/api/assignments`, {
    credentials: 'include'
  });

  if (!response.ok) throw new Error("Failed to fetch assignments.");

  const data = await response.json();

  return data;
};

// PATCH /api/assignments/:id/grade
const submitGrade = async (assignmentId, grade) => {
  const response = await fetch(`${SERVER_URL}/api/assignments/${assignmentId}/grade`, {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ grade })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to submit grade.");
  }
};

const getStudentsClassState = async () => {
  const response = await fetch(`${SERVER_URL}/api/students/state`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error("Failed to fetch class state.");
  }
  return await response.json();
};


// GET /api/assignments/student
const getStudentAssignments = async () => {
  const response = await fetch(`${SERVER_URL}/api/assignments/student`, {
    credentials: 'include'
  });

  if (!response.ok) throw new Error("Failed to fetch student assignments.");
  return await response.json();
};

// PUT /api/assignments/:id/response
const submitResponse = async (assignmentId, responseText) => {
  const response = await fetch(`${SERVER_URL}/api/assignments/${assignmentId}/response`, {
    method: 'PUT',
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ response: responseText })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to submit response.");
  }
};

const getStudentWeightedAverage = async () => {
  const response = await fetch(`${SERVER_URL}/api/students/me/average`, {
    credentials: 'include'
  });

  if (!response.ok) throw new Error("Failed to fetch weighted average.");
  return await response.json();
};

const API = { login, getUser, logout, getStudentsList, createAssignment, getEvaluableAssignments, submitGrade, getStudentsClassState, getStudentAssignments, submitResponse, getStudentWeightedAverage };
export default API;
