import { Route, Routes } from "react-router-dom"
import Guest from "./Layout/Guest"
import Brands from "./pages/Brands"
import BrandForm from "./pages/Brands/Form"
import Categories from "./pages/Categories"
import CategoryForm from "./pages/Categories/Form"
import Colors from "./pages/Colors"
import ColorForm from "./pages/Colors/Form"
import Footer from "./pages/Footer"
import Header from "./pages/Header"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Media from "./pages/Media"
import NotFound from "./pages/NotFound"
import Pages from "./pages/Pages"
import Products from "./pages/Products"
import ProductForm from "./pages/Products/Form"
import PromoCodes from "./pages/PromoCodes"
import PromoCodeForm from "./pages/PromoCodes/Form"
import Sizes from "./pages/Sizes"
import SizeForm from "./pages/Sizes/Form"
import Socials from "./pages/Socials"
import SocialForm from "./pages/Socials/Form"
import Styles from "./pages/Styles"
import StyleForm from "./pages/Styles/Form"
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
        <Route path="/products/create" element={<ProductForm />} />
        <Route path="/products/update/:id" element={<ProductForm mode="update" />} />
        <Route path="/products/clone/:id" element={<ProductForm mode="clone" />} />
        <Route path="/products/:id" element={<ProductForm mode="view" />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/brands/create" element={<BrandForm />} />
        <Route path="/brands/update/:id" element={<BrandForm mode="update" />} />
        <Route path="/brands/clone/:id" element={<BrandForm mode="clone" />} />
        <Route path="/brands/:id" element={<BrandForm mode="view" />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/create" element={<CategoryForm />} />
        <Route path="/categories/update/:id" element={<CategoryForm mode="update" />} />
        <Route path="/categories/clone/:id" element={<CategoryForm mode="clone" />} />
        <Route path="/categories/:id" element={<CategoryForm mode="view" />} />
        <Route path="/styles" element={<Styles />} />
        <Route path="/styles/create" element={<StyleForm />} />
        <Route path="/styles/update/:id" element={<StyleForm mode="update" />} />
        <Route path="/styles/clone/:id" element={<StyleForm mode="clone" />} />
        <Route path="/styles/:id" element={<StyleForm mode="view" />} />
        <Route path="/colors" element={<Colors />} />
        <Route path="/colors/create" element={<ColorForm />} />
        <Route path="/colors/update/:id" element={<ColorForm mode="update" />} />
        <Route path="/colors/clone/:id" element={<ColorForm mode="clone" />} />
        <Route path="/colors/:id" element={<ColorForm mode="view" />} />
        <Route path="/sizes" element={<Sizes />} />
        <Route path="/sizes/create" element={<SizeForm />} />
        <Route path="/sizes/update/:id" element={<SizeForm mode="update" />} />
        <Route path="/sizes/clone/:id" element={<SizeForm mode="clone" />} />
        <Route path="/sizes/:id" element={<SizeForm mode="view" />} />

        <Route path="/users" element={<Users />} />
        <Route path="/promo-codes" element={<PromoCodes />} />
        <Route path="/promo-codes/create" element={<PromoCodeForm />} />
        <Route path="/promo-codes/update/:id" element={<PromoCodeForm mode="update" />} />
        <Route path="/promo-codes/clone/:id" element={<PromoCodeForm mode="clone" />} />
        <Route path="/promo-codes/:id" element={<PromoCodeForm mode="view" />} />
        <Route path="/media" element={<Media />} />
        <Route path="/socials" element={<Socials />} />
        <Route path="/socials/create" element={<SocialForm />} />
        <Route path="/socials/update/:id" element={<SocialForm mode="update" />} />
        <Route path="/socials/clone/:id" element={<SocialForm mode="clone" />} />
        <Route path="/socials/:id" element={<SocialForm mode="view" />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
