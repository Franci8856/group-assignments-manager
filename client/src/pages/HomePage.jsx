import { Container } from 'react-bootstrap';
import { LoginForm } from '../components/Login.jsx';

function HomePage({handleLogin}) {
  return (
    <Container className="justify-content-center mt-4">
      <LoginForm handleLogin={handleLogin} />
    </Container>
  );
}

export default HomePage;
