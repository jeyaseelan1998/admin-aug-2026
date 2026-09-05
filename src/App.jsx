import { Route, Routes } from "react-router-dom"
import Guest from "./Layout/Guest"
import Home from "./pages/Home"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import Protected from "./Layout/Protected"

function App() {
  return (
    <Routes>
      <Route element={<Guest />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<Protected />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
