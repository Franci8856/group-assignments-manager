import { useEffect, useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import API from '../API/API.mjs';

function AnswerForm({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [responses, setResponses] = useState({});
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState(''); // success or danger del submit answer

  useEffect(() => {
    API.getStudentAssignments()
      .then(data => {
        const openAssignments = data.filter(a => a.status === 'open');
        setAssignments(openAssignments);

        const initialResponses = {}; //aggiornare il box risposta dei compiti aperti
        openAssignments.forEach(a => {
          initialResponses[a.id] = a.response || '';
        });
        setResponses(initialResponses);
      })
      .catch(() => {
        setMessage('Failed to load assignments.');
        setVariant('danger');
      });
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setVariant('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (assignmentId, value) => {
    setResponses(prev => ({ ...prev, [assignmentId]: value }));
  };

  const handleSubmit = async (assignmentId) => {
    const text = responses[assignmentId]?.trim();
    if (!text) {
      setMessage('Please enter a response.');
      setVariant('danger');
      return;
    }
    try {
      const latest = await API.getStudentAssignments();
      const assignment = latest.find(a => a.id === assignmentId);

      if (!assignment || assignment.status !== 'open') {
        setMessage('❌ Assignment is no longer open. You cannot submit a response.');
        setVariant('danger');
        return;
      }

      await API.submitResponse(assignmentId, text);
      setMessage('✅ Response submitted successfully.');
      setVariant('success');

      // aggiorna subito il valore modificato nel campo responses
      setResponses(prev => ({ ...prev, [assignmentId]: text }));

      // Ricarica gli assignment aperti
      const openAssignments = latest.filter(a => a.status === 'open');
      setAssignments(openAssignments);

    } catch (err) {
      setMessage('❌ Failed to submit response.');
      setVariant('danger');
    }
  };

  const hasResponse = (assignment) => {
    return assignment.response && assignment.response.trim() !== '';
  };

  const getCardClasses = (assignment) => {
    return hasResponse(assignment) ? 'border-warning' : '';
  };
  

  if (assignments.length === 0)
    return <Alert variant="info">No open assignments available</Alert>;

  return (
    <Container className="mt-4">
      <h3>Answer Assignment</h3>
      {message && <Alert variant={message.startsWith('✅') ? 'success' : 'danger'}>{message}</Alert>} 

      {assignments.map(a => (
        <Card className={`mb-4 border ${getCardClasses(a)}`}
          style={hasResponse(a) ? { borderWidth: '2px' } : {}}
          key={a.id}
        >
          <Card.Body>
            <Card.Text><strong>Question:</strong> {a.question}</Card.Text>

            <Form.Group>
              <Form.Label>Your Answer:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={responses[a.id]}
                onChange={(e) => handleChange(a.id, e.target.value)}
              />
            </Form.Group>

            <Button className="mt-2" onClick={() => handleSubmit(a.id)}>Submit Answer</Button>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default AnswerForm;