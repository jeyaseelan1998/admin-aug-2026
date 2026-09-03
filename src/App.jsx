import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" expand="sm">
        <Container>
          <Navbar.Brand as={Link} to="/">
            admin-aug-2026
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav>
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container as="main" className="py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
