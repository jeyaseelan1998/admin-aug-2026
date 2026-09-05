import { Container, Spinner } from 'react-bootstrap'
import { Navigate, Outlet } from 'react-router-dom'

import Fetch from "../Components/Fetch";
import Sidebar from "./Sidebar";

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
                <div className="app-layout">
                  <Sidebar />
                  <main className="flex-grow-1" style={{ minWidth: 0 }}>
                    <Container fluid className="py-4">
                      <Outlet />
                    </Container>
                  </main>
                </div>
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
