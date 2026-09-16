/* eslint-disable react-hooks/set-state-in-effect */
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.jsx'

const MOBILE_QUERY = '(max-width: 780px)'

// eslint-disable-next-line react-refresh/only-export-components
function ResponsiveToastContainer() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const handleChange = (event) => setIsMobile(event.matches)

    setIsMobile(query.matches)
    query.addEventListener('change', handleChange)

    return () => query.removeEventListener('change', handleChange)
  }, [])

  return <ToastContainer position={isMobile ? 'bottom-center' : 'top-right'} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <ResponsiveToastContainer />
    </BrowserRouter>
  </StrictMode>,
)
