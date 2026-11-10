// da modificare /teacher/home
// da modificare /student/home
import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Button, Form, Card } from 'react-bootstrap';
import API from '../API/API.mjs';

function AssignmentEvaluation({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadAssignments = () => {
    API.getEvaluableAssignments()
      .then(data => {
        const filtered = data.filter(a =>
          a.status === 'open' &&
          a.teacherId === user.id &&
          a.response &&
          a.grade === null
        );
        setAssignments(filtered);
        setGrades({}); // reset input voti
      })
      .catch(() => setError('Failed to fetch assignments.'));
  };

  useEffect(() => {
    loadAssignments();
  }, [user.id]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleGradeChange = (assignmentId, value) => {
    setGrades(prev => ({ ...prev, [assignmentId]: value }));
  };

  const handleSubmitGrade = async (assignmentId) => {
    const value = grades[assignmentId];
    if (!value || isNaN(value) || value < 0 || value > 30) {
      setError('Insert a valid grade between 0 and 30.');
      return;
    }
    try {
      await API.submitGrade(assignmentId, Number(value));
      setSuccessMessage(`✅ Grade ${value}/30 submitted`);
      loadAssignments(); // aggiorna lista
    } catch {
      setError('❌ Failed to submit grade.');
    }
  };

  return (
    <Container className="mt-4">
      <h2>Assignment Evaluation</h2>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {assignments.length === 0 ? (
        <Alert variant="info">No assignments to evaluate</Alert>
      ) : (
        assignments.map(a => (
          <Card className="mb-4" key={a.id}>
            <Card.Body>
              <p><strong>Question:</strong> {a.question}</p>
              <p><strong>Response:</strong> {a.response || 'No response provided'}</p>
              <Form.Group as={Row} className="align-items-center mb-2">
                <Form.Label column sm="2">Grade</Form.Label>
                <Col sm="4">
                  <Form.Control
                    type="number"
                    min={0}
                    max={30}
                    value={grades[a.id] || ''}
                    onChange={(e) => handleGradeChange(a.id, e.target.value)}
                  />
                </Col>
                <Col sm="6">
                  <Button onClick={() => handleSubmitGrade(a.id)}>Submit Grade</Button>
                </Col>
              </Form.Group>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}



export default AssignmentEvaluation;
