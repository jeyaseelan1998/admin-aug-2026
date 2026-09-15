import { Container } from 'react-bootstrap'
import { Navigate, Outlet } from 'react-router-dom'

import Fetch from "../Components/Fetch";

function Guest() {
  return (
    <Fetch
      url="/auth/profile"
      render={({ loading, data }) => {
        return (
          <>
            {
              !loading && !data && (
                <Container className="d-flex align-items-center justify-content-center min-vh-100">
                  <div className="w-100" style={{ maxWidth: 400 }}>
                    <Outlet />
                  </div>
                </Container>
              )
            }
            {
              !loading && data && (
                <Navigate to="/" replace />
              )
            }
          </>
        )
      }}
    />
  )
}

export default Guest
