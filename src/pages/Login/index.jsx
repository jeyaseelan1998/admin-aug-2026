import { Button, Card } from 'react-bootstrap'
import Form from '../../Components/Form'
import Field from '../../Components/Form/Field'
import { required } from '../../helpers/validators'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate();
  return (
    <Card>
      <Card.Body className="p-4">
        <Card.Title as="h1" className="h4 mb-4">
          Login
        </Card.Title>

        <Form url="/auth/signin" onSuccess={() => navigate('/admin')}>
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
