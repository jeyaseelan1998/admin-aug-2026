import { Button, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="w-100 text-center" style={{ maxWidth: 400 }}>
        <h1 className="h4 mb-4">Page not found</h1>

        <Button as={Link} to="/" variant="primary">
          Back to home
        </Button>
      </div>
    </Container>
  )
}

export default NotFound
