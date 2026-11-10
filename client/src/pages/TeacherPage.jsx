import { Container, Row, Col, Alert } from 'react-bootstrap';

function TeacherPage({ user }) {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Alert variant="primary" className="text-center">
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧑🏻‍🏫</p>
            <h2>Welcome, {user?.name || ''}!</h2>
            <p className="mb-0">{user?.email}</p>
            <p>This is your teacher area.</p>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
}

export default TeacherPage;
