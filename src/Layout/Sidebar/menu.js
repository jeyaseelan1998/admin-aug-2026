import {
  FiActivity,
  FiAlertTriangle,
  FiBox,
  FiChevronsDown,
  FiChevronsUp,
  FiClipboard,
  FiDroplet,
  FiFileText,
  FiGrid,
  FiImage,
  FiLayers,
  FiLayout,
  FiLogOut,
  FiMaximize,
  FiPercent,
  FiShare2,
  FiTag,
  FiUsers,
} from '../../Components/Icons'
import api from '../../helpers/axios'

const PAGE = [
  { to: '/pages', label: 'Pages', icon: FiFileText, end: true },
  {
    label: 'Sections',
    icon: FiLayout,
    items: [
      { to: '/header', label: 'Header', icon: FiChevronsUp, end: true },
      { to: '/footer', label: 'Footer', icon: FiChevronsDown, end: true },
    ],
  },
]

// Mirrors the CMS resources exposed by the API (/api/cms/*).
const PRODUCT = [
  { to: '/products', label: 'Products', icon: FiBox },
  { to: '/brands', label: 'Brands', icon: FiTag },
  { to: '/categories', label: 'Categories', icon: FiGrid },
  { to: '/styles', label: 'Styles', icon: FiLayers },
  { to: '/colors', label: 'Colors', icon: FiDroplet },
  { to: '/sizes', label: 'Sizes', icon: FiMaximize },
]

const ADMIN = [
  { to: '/users', label: 'Users', icon: FiUsers, end: true },
  { to: '/promo-codes', label: 'Promo Codes', icon: FiPercent },
  { to: '/media', label: 'Media', icon: FiImage },
  { to: '/socials', label: 'Socials', icon: FiShare2 },
  {
    label: 'Logs',
    icon: FiClipboard,
    items: [
      { to: '/error', label: 'Error', icon: FiAlertTriangle, end: true },
      { to: '/api-log', label: 'API Log', icon: FiActivity, end: true },
    ],
  },
]

// The cms_token cookie is httpOnly, so only the server can clear it; the reload
// afterwards drops every cached profile/list response the session held.
const logout = async () => {
  await api.post('/auth/signout').catch(() => { })

  window.location.replace('/admin/login')
}

const ACCOUNT = [
  { label: 'Logout', icon: FiLogOut, onClick: logout },
]

const SECTIONS = [
  { title: 'Page', items: PAGE },
  { title: 'Product', items: PRODUCT },
  { title: 'Admin', items: ADMIN },
  { title: 'Account', items: ACCOUNT },
]

export default SECTIONS
