import { Button, Card } from 'react-bootstrap'
import Form from '../../Components/Form'
import Field from '../../Components/Form/Field'
import { required } from '../../helpers/validators'

export default function Login() {
  return (
    <Card>
      <Card.Body className="p-4">
        <Card.Title as="h1" className="h4 mb-4">
          Login
        </Card.Title>

        <Form url="/auth/signin">
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
