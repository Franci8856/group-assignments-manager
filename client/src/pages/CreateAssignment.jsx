import { Form, Button, Alert, Row, Col, Container, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../API/API.mjs';

function CreateAssignment() { // Page finale per distinguerla da createAssignment()
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [serverError, setServerError] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const sList = await API.getStudentsList();
        setStudents(sList);
      } catch (error) {
        setServerError('Failed to load students.');
      }
    };
    fetchStudents();
  }, []);

  const toggleSelect = (id) => {
    setSelected((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id]
    );
  };

  const handleSubmit = async () => {

    if (!questionText || selected.length < 2 || selected.length > 6) {
      return setServerError('Insert a question and select between 2 and 6 students.');
    }

    try {
      await API.createAssignment({ question: questionText, studentIds: selected });

      setSuccessMessage('✅ Assignment created successfully!');
      setServerError("");
      setQuestionText("");
      setSelected([]);
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      if (error.message?.includes('ha già svolto')) {
        setServerError('One or more selected students have already collaborated more than 2 times.');
      } else {
        setServerError(error.message || 'Failed to create assignment.');
      }
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col><h2>Create Assignment</h2></Col>
      </Row>
      {serverError && <Alert variant="danger">{serverError}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form>
        <Row>
          {/* LEFT: STUDENT LIST */}
          <Col md={4}>
            <h5>Students</h5>
            <ListGroup>
              {students.map(s => (
                <ListGroup.Item
                  key={s.id}
                  action
                  active={selected.includes(s.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSelect(s.id);
                  }}
                >
                  {s.name} {s.surname}
                  {selected.includes(s.id) && <Badge bg="success" className="float-end">Selected</Badge>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>

          {/* RIGHT: QUESTION + SELECTED STUDENTS */}
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Question: </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </Form.Group>

            <h6>Selected Students:</h6>
            <div className="mb-3">
              {selected.map(id => {
                const s = students.find(s => s.id === id);
                return <Badge key={id} className="me-2">{s?.name} {s?.surname}</Badge>;
              })}
            </div>
            
            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setQuestionText('');
                  setSelected([]);
                  setServerError('');
                  setSuccessMessage('');
                }}
              >
                Reset
              </Button>
            
              <Button onClick={handleSubmit}>
                Create Assignment
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default CreateAssignment;
