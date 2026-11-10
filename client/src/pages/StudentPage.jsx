import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Badge, Card } from 'react-bootstrap';
import API from '../API/API.mjs';

function StudentPage({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [weightedAverage, setWeightedAverage] = useState(null);

  useEffect(() => {
    // Chiamo entrambe le API
    Promise.all([
      API.getStudentAssignments(),
      API.getStudentWeightedAverage()
    ])
    .then(([assignments, { average }]) => {
      setAssignments(assignments);
      setWeightedAverage(average ?? null); // così funziona anche se non ho voti, medie o assignments salvati
      setVariant('success');
    })
    .catch(() => {
      setError('Failed to fetch assignments');
      setMessage('❌ Failed to load assignments.');
      setVariant('danger');
    });
  }, [user.id]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setVariant('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);


  const graded = assignments.filter(a => a.status === 'closed' && a.grade !== null);

  return (
    <Container className="mt-5">
      {/* Welcome Card */}
      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <Alert variant="info" className="text-center">
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧑🏻‍🎓</p>
            <h2>Welcome, {user?.name || ''}!</h2>
            <p className="mb-0">{user?.email}</p>
            <p>This is your student area.</p>
          </Alert>
        </Col>
      </Row>

      {message && <Alert variant={variant}>{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {/*Media Ponderata*/}
      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <Card className="text-center">
            <Card.Body>
              <h5>Your Weighted Average Grade</h5>
              <h3>
                {weightedAverage !== null ? (
                  <Badge bg="primary" style={{ fontSize: '1.5rem' }}>
                    {weightedAverage} / 30
                  </Badge>
                ) : (
                  <Badge bg="secondary" style={{ fontSize: '1.5rem' }}>
                    No grades yet
                  </Badge>
                )}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/*Closed Assignments*/}
      <Row>
        <Col>
          <h4 className="mb-3">Closed Assignments ({graded.length})</h4>
          {graded.length === 0 ? (
            <Alert variant="info">No closed assignments yet.</Alert>
          ) : (
            graded.map(a => (
              <Card key={a.id} className="mb-3">
                <Card.Body className="pt-2 pb-3 px-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="d-flex mb-1">
                        <strong className="me-2">Question:</strong>
                        <span>{a.question}</span>
                      </div>
                      <div className="d-flex">
                        <strong className="me-2">Answer:</strong>
                        <span className="text-muted">{a.response || 'No response provided'}</span>
                      </div>
                    </div>
                    <Badge bg="success" style={{ fontSize: '1rem', padding: '0.4em 0.8em', height: 'fit-content' }}>
                      Grade: {a.grade}/30
                    </Badge>
                  </div>
                </Card.Body>

              </Card>
            ))
          )}
        </Col>
      </Row>
      
    </Container>
  );
}

export default StudentPage;
