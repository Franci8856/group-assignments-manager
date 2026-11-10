import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Container } from 'react-bootstrap';

import './App.css'
import API from "./API/API.mjs";

// import components
import HomePage from "./pages/HomePage";
import DefaultLayout from "./components/DefaultLayout";
import NotFound from "./components/NotFound";
import CreateAssignment from "./pages/CreateAssignment";
import AssignmentEvaluation from "./pages/AssignmentEvaluation";
import AnswerForm from "./pages/AnswerForm";
import ClassStatus from "./pages/ClassStatus";
import TeacherPage from './pages/TeacherPage';
import StudentPage from './pages/StudentPage';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await API.getUser();
        setUser(user);
        setLoggedIn(true);
      } catch (err) {
        setUser(null);
        setLoggedIn(false);
      } finally { // lo esegue sempre; da togliere dopo (?)
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.login(credentials); //API.login(username, password);
      setLoggedIn(true);
      setUser(user);
      setMessage({ msg: `Welcome, ${user.name}`, type: 'success' });
      
      if (user.role === "teacher") navigate("/teacher");
      else if (user.role === "student") navigate("/student"); 

      return user;
    } catch (err) {
      setMessage({ msg: err.message || err, type: 'danger' });
      //throw err;
    }
  };

  const handleLogout = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser(null);
    // clean up everything
    setMessage("");
    navigate("/");
  };

  if (loading) return <div>Loading...</div>; // decidere se lasciarlo

  return (
    <Container>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              user={user}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              message={message}
            />
          }
        />


        <Route element={ <DefaultLayout user={user} handleLogout={handleLogout} /> }>
         
         {/* TEACHER ROUTES */}
         <Route
            path="/teacher"
            element={
              user?.role === 'teacher' ? (
                <TeacherPage user={user} handleLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/teacher/create-assignment"
            element={
              user?.role === 'teacher' ? (
                <CreateAssignment user={user} handleLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/teacher/assignment-evaluation"
            element={
              user?.role === 'teacher' ? (
                <AssignmentEvaluation user={user} handleLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/teacher/class-status"
            element={
              user?.role === 'teacher' ? (
                <ClassStatus user={user} handleLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          /> 

           {/* STUDENTS ROUTES */}
           <Route
            path="/student"
            element={
              user?.role === 'student' ? (
                <StudentPage user={user} handleLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/student/answer-form"
            element={
              user?.role === 'student' ? (
                <AnswerForm user={user} handleLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Container>
  );
}

export default App;
