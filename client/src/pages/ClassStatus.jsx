import { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Alert, Button, ButtonGroup, Badge } from 'react-bootstrap';
import API from '../API/API.mjs';


function ClassStatus({ user }) {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('alphabetic'); // 'alphabetic', 'totalAssignments', 'averageGrade'

  useEffect(() => {
    const fetchClassState = async () => {
      try {
        setLoading(true);
        const data = await API.getStudentsClassState();
        setStudentsData(data);
        setError('');
      } catch (err) {
        setError('Errore nel caricamento dello stato della classe.');
        console.error('Error fetching class state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassState();
  }, []);

  // Funzione per ordinare i dati
  const getSortedData = () => {
    const dataCopy = [...studentsData];
    
    switch (sortBy) {
      case 'alphabetic':
        return dataCopy.sort((a, b) => {
          const nameA = `${a.surname} ${a.name}`.toLowerCase();
          const nameB = `${b.surname} ${b.name}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
      case 'totalAssignments':
        return dataCopy.sort((a, b) => {
          const totalA = a.openCount + a.closedCount;
          const totalB = b.openCount + b.closedCount;
          return totalB - totalA; // Ordine decrescente
        });
        
      case 'averageGrade':
        return dataCopy.sort((a, b) => {
          const gradeA = parseFloat(a.averageGrade) || 0;
          const gradeB = parseFloat(b.averageGrade) || 0;
          return gradeB - gradeA; // Ordine decrescente
        });
        
      default:
        return dataCopy;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <h2>Stato Generale della Classe</h2>
        <Alert variant="info">Caricamento dati...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <h2>Stato Generale della Classe</h2>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const sortedData = getSortedData();

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2> Overall Class Status </h2>
          <p className="text-muted">
          </p>
        </Col>
      </Row>

      {studentsData.length === 0 ? (
        <Alert variant="warning">
          <h5>Nessuno studente trovato</h5> 
          <p>Non hai ancora assegnato compiti a nessuno studente.</p>
        </Alert>
      ) : (
        <>
          {/* Ordinamento */}
          <Row className="mb-3">
            <Col>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold">Sort by:</span>
                <ButtonGroup size="sm">
                  <Button
                    variant={sortBy === 'alphabetic' ? 'primary' : 'outline-primary'}
                    onClick={() => setSortBy('alphabetic')}
                  >
                    📝 Alphabet
                  </Button>
                  <Button
                    variant={sortBy === 'totalAssignments' ? 'primary' : 'outline-primary'}
                    onClick={() => setSortBy('totalAssignments')}
                  >
                    📊 N° Assignments
                  </Button>
                  <Button
                    variant={sortBy === 'averageGrade' ? 'primary' : 'outline-primary'}
                    onClick={() => setSortBy('averageGrade')}
                  >
                    ⭐ Average
                  </Button>
                </ButtonGroup>
              </div>
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Student</th>
                <th className="text-center">Open Assignments</th>
                <th className="text-center">Closed Assignments</th>
                <th className="text-center">Total Assignments</th>
                <th className="text-center">Weighted Average</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((student) => {
                const totalAssignments = student.openCount + student.closedCount;
                const averageGrade = parseFloat(student.averageGrade);
                
                // Colore della media
                let gradeVariant = 'secondary';
                if (averageGrade >= 24) gradeVariant = 'success';
                else if (averageGrade >= 18) gradeVariant = 'warning';
                else if (averageGrade > 0) gradeVariant = 'danger';

                return (
                  <tr key={student.studentId}>
                    <td>
                      <div>
                        <strong>{student.surname} {student.name}</strong>
                      </div>
                    </td>
                    <td className="text-center">
                      {student.openCount > 0 ? (
                        <Badge bg="info">{student.openCount}</Badge>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td className="text-center">
                      {student.closedCount > 0 ? (
                        <Badge bg="success">{student.closedCount}</Badge>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td className="text-center">
                      <strong>{totalAssignments}</strong>
                    </td>
                    <td className="text-center">
                      {student.averageGrade ? (
                        <Badge bg={gradeVariant} className="px-3">
                          {student.averageGrade}
                        </Badge>
                      ) : (
                        <span className="text-muted"></span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
}

export default ClassStatus;

//La media è calcolata con pesi inversamente proporzionali al numero di studenti nel gruppo. 
//Un voto ottenuto in un gruppo di 3 studenti vale il doppio rispetto a un voto in un gruppo di 6 studenti.
            
