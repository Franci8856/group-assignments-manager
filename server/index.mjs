// server/index.mjs
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';

import {
  getUser,
  getAllStudents,
  createAssignment,
  getAssignmentsByTeacher,
  addResponse,
  gradeAssignment,
  getStudentAssignments,
  getStudentsClassState,
  getStudentWeightedAverage
} from './models/dao.mjs';

// Init
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(morgan('dev'));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessState: 200,
  credentials: true
};

app.use(cors(corsOptions));

passport.use(new LocalStrategy({
  usernameField: 'email',  
  passwordField: 'password'
}, async function verify(email, password, cb) {
  const user = await getUser(email, password);
  if (!user) 
    return cb(null, false, 'Invalid credentials');
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
};

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

// Routes

// Auth routes
// login

app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
  //console.log("✅ Login successful for user:", req.user);
  res.status(201).json(req.user);
});


// current user session
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) res.json(req.user);
  else res.status(401).json({ error: 'Not authenticated' });
});

// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => res.status(204).end());
});

// GET all students
app.get('/api/students', isLoggedIn, async (req, res) => {
  try {
    const students = await getAllStudents();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve students' });
  }
});

// POST create assignment 
app.post('/api/assignments', isLoggedIn, async (req, res) => {
  const { question, studentIds } = req.body;
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can create assignments' });
  }

  if (!question || !Array.isArray(studentIds)) {
    return res.status(400).json({ error: 'Invalid assignment data' });
  }
  if (studentIds.length < 2 || studentIds.length > 6) {
    return res.status(422).json({ error: 'Group must include between 2 and 6 students' });
  }

  try {
    const id = await createAssignment(req.user.id, question, studentIds);
    res.status(201).json({ id });
  } catch (e) {
    res.status(422).json({ error: e.message });
  }
});

// GET 
app.get('/api/assignments', isLoggedIn, async (req, res) => {
  try {
    const assignments = await getAssignmentsByTeacher(req.user.id);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve assignments' });
  }
});

// PUT response (by student)
app.put('/api/assignments/:id/response', isLoggedIn, async (req, res) => {
  const { response } = req.body;
  const assignmentId = parseInt(req.params.id);
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can submit or edit responses' });
  }

  if (!response || isNaN(assignmentId)) {
    return res.status(400).json({ error: 'Missing response or invalid assignment ID' });
  }

  try {
    const result = await addResponse(assignmentId, response);
    if (result === 'forbidden') {
      return res.status(403).json({ error: 'Cannot update response: assignment is already closed or not found' });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to update response' });
  }
});

// PATCH 
app.patch('/api/assignments/:id/grade', isLoggedIn, async (req, res) => {
  const { grade } = req.body;
  const assignmentId = parseInt(req.params.id);

  if (typeof grade !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid grade' });
  }

  try {
    const result = await gradeAssignment(req.params.id, req.body.grade);
    if (result === 0) return res.status(403).json({ error: 'Cannot grade this assignment: assignment must have a response and be open to be graded' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to grade assignment' });
  }
});

// GET 
app.get('/api/assignments/student', isLoggedIn, async (req, res) => {
  try {
    const assignments = await getStudentAssignments(req.user.id);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve student assignments' });
  }
});

// GET 
app.get('/api/students/state', isLoggedIn, async (req, res) => {
  try {
    const data = await getStudentsClassState(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve class state' });
  }
});

app.get('/api/students/me/average', isLoggedIn, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });

  try {
    const average = await getStudentWeightedAverage(req.user.id);
    res.json({ average: average || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute weighted average' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
