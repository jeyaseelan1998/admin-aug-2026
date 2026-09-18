import { Button, Container } from 'react-bootstrap'

function NotFound() {
  const onClick = () => window.location.href = '/';
  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="w-100 text-center" style={{ maxWidth: 400 }}>
        <h1 className="h4 mb-4">Page not found</h1>

        <Button variant="primary" onClick={onClick}>
          Back to home
        </Button>
      </div>
    </Container>
  )
}

export default NotFound
