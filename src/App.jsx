import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

export default App
