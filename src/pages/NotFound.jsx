import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <Button as={Link} to="/" variant="primary" className="mt-3">
        Back to home
      </Button>
    </>
  )
}

export default NotFound
