import { Alert, Button, Card } from 'react-bootstrap'
import Form from '../../Components/Form'
import Field from '../../Components/Form/Field'
import { required } from '../../helpers/validators'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate();
  // Set when a session was ended while in use (see helpers/axios.js).
  const [searchParams] = useSearchParams();
  const sessionEnded = searchParams.has('ended');
  return (
    <Card>
      <Card.Body className="p-4">
        <Card.Title as="h1" className="h4 mb-4">
          Login
        </Card.Title>

        {sessionEnded && (
          <Alert variant="warning">Your session has ended. Please sign in again.</Alert>
        )}

        <Form url="/auth/signin" onSuccess={() => navigate('/')}>
          {({ submitting }) => (
            <>
              <Field
                name="email"
                label="Email"
                type="email"
                validate={required('Email is required')}
              />
              <Field
                name="password"
                label="Password"
                type="password"
                validate={required('Password is required')}
              />

              <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
                Sign in
              </Button>
            </>
          )}
        </Form>
      </Card.Body>
    </Card>
  )
}
