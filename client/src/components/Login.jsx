import { useActionState } from "react";
import { Form, Button, Row, Col, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function LoginForm({handleLogin}) {
    const [state, formAction, isPending] = useActionState(loginFunction, {email: '', password: ''});
    const navigate = useNavigate();

    async function loginFunction(prevState, formData) {
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
        };

        try {
            await handleLogin(credentials);
            return { success: true };
        } catch (error) {
            return { error: 'Login failed. Check your credentials.' };
        }
    }

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Row>
                <Col md={12}>
                    {isPending && <Alert variant="warning">Please, wait for the server's response...</Alert>}
                    <h2 className="mb-4 text-center">CLASS ASSIGNMENTS</h2>
                    <Form action={formAction}>
                        <Form.Group controlId='email' className='mb-3'>
                            <Form.Label>Email</Form.Label>
                            <Form.Control type='email' name='email' required />
                        </Form.Group>

                        <Form.Group controlId='password' className='mb-3'>
                            <Form.Label>Password</Form.Label>
                            <Form.Control type='password' name='password' required minLength={6} />
                        </Form.Group>

                        {state.error && <p className="text-danger">{state.error}</p>}

                        <Button type='submit' disabled={isPending}>Login</Button>
                        <Button variant='danger' className='mx-2 my-2' type='reset' disabled={isPending}> Cancel </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

function LogoutButton(props) {
  return <Button variant='outline-light' onClick={props.logout}>Logout</Button>;
}

export { LoginForm, LogoutButton };