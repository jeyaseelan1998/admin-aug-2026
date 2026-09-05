import { Container, Spinner } from 'react-bootstrap'
import { Navigate, Outlet } from 'react-router-dom'

import Fetch from "../Components/Fetch";

function Protected() {
  return (
    <Fetch
      url="/auth/profile"
      skeleton={
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading…</span>
          </Spinner>
        </Container>
      }
      render={({ loading, data }) => {
        return (
          <>
            {
              !loading && data && (
                <Outlet />
              )
            }
            {
              !loading && !data && (
                <Navigate to="/login" replace />
              )
            }
          </>
        )
      }}
    />
  )
}

export default Protected
