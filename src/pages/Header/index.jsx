import { Card } from 'react-bootstrap'

export default function Header() {
  return (
    <Card>
      <Card.Body className="p-4">
        <Card.Title as="h1" className="h4 mb-0">
          Header
        </Card.Title>
      </Card.Body>
    </Card>
  )
}
