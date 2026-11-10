import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

function AppNavbar({ user, handleLogout }) {
  return (
    <Navbar bg="light" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand className="fw-bold"> TASK BOARD <span style={{ fontSize: '1.2rem' }}> </span> </Navbar.Brand>

        <Nav className="me-auto">

          {user?.role === 'teacher' && (
            <>
              <Nav.Link as={NavLink} to="/teacher">Home</Nav.Link>
              <Nav.Link as={NavLink} to="/teacher/create-assignment">Create Assignment</Nav.Link>
              <Nav.Link as={NavLink} to="/teacher/assignment-evaluation">Assignment Evaluation</Nav.Link>
              <Nav.Link as={NavLink} to="/teacher/class-status">Class Status</Nav.Link>
            </>
          )}

          {user?.role === 'student' && (
            <>
              <Nav.Link as={NavLink} to="/student">Home</Nav.Link>
              <Nav.Link as={NavLink} to="/student/answer-form">Answer Form</Nav.Link>
            </>
          )}
        </Nav>

        {user && (
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small">👤 {user.name}</span>
            <Button variant="outline-secondary" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        )}
      </Container>
    </Navbar>
  );
}

export default AppNavbar;