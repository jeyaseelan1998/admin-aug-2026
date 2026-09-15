import { Route, Routes } from "react-router-dom"
import Guest from "./Layout/Guest"
import Brands from "./pages/Brands"
import Categories from "./pages/Categories"
import Colors from "./pages/Colors"
import Footer from "./pages/Footer"
import Header from "./pages/Header"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Media from "./pages/Media"
import NotFound from "./pages/NotFound"
import Pages from "./pages/Pages"
import Products from "./pages/Products"
import PromoCodes from "./pages/PromoCodes"
import Sizes from "./pages/Sizes"
import Socials from "./pages/Socials"
import Styles from "./pages/Styles"
import Users from "./pages/Users"
import Protected from "./Layout/Protected"

function App() {
  return (
    <Routes>
      <Route element={<Guest />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<Protected />}>
        <Route path="/" element={<Home />} />

        <Route path="/pages" element={<Pages />} />
        <Route path="/header" element={<Header />} />
        <Route path="/footer" element={<Footer />} />

        <Route path="/products" element={<Products />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/styles" element={<Styles />} />
        <Route path="/colors" element={<Colors />} />
        <Route path="/sizes" element={<Sizes />} />

        <Route path="/users" element={<Users />} />
        <Route path="/promo-codes" element={<PromoCodes />} />
        <Route path="/media" element={<Media />} />
        <Route path="/socials" element={<Socials />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
