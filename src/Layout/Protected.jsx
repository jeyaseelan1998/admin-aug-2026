import { useEffect } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import { Navigate, Outlet } from 'react-router-dom'
import api, { endSession } from '../helpers/axios'

import Fetch from "../Components/Fetch";
import Sidebar from "./Sidebar";

// How often an open admin re-checks its session while the tab is visible.
const SESSION_CHECK_MS = 60 * 1000

/**
 * Notices a session ended elsewhere (an admin logged this user out, or the
 * token expired) even while the page sits idle, and sends the user to sign
 * in. Checks on an interval while the tab is visible and on returning to it.
 */
function useSessionCheck() {
  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== 'visible') return

      api.get('/auth/profile').catch((error) => {
        if (error.response?.status === 401) endSession()
      })
    }

    const timer = setInterval(check, SESSION_CHECK_MS)

    document.addEventListener('visibilitychange', check)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])
}

function Protected() {
  useSessionCheck()

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
                  <main className="app-content">
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
