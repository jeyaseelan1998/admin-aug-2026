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
import { clearSession } from '../../helpers/session'

const CONTENT = [
  { to: '/pages', label: 'Pages', icon: FiFileText },
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

// The signout call marks the account offline; the token itself lives here, so
// it is dropped locally either way. The reload clears every cached response.
const logout = async () => {
  await api.post('/auth/signout').catch(() => { })
  clearSession()

  window.location.replace('/login')
}

const ACCOUNT = [
  {
    label: 'Logout',
    icon: FiLogOut,
    onClick: logout,
    confirm: {
      title: 'Log out?',
      message: 'You will need to sign in again to use the admin.',
      confirmLabel: 'Yes, log out',
    },
  },
]

const SECTIONS = [
  { title: 'Content', items: CONTENT },
  { title: 'Product', items: PRODUCT },
  { title: 'Admin', items: ADMIN },
  { title: 'Account', items: ACCOUNT },
]

export default SECTIONS
