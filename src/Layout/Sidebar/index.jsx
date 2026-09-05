import { useEffect, useState } from 'react'
import { Collapse, Offcanvas } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'

import {
  FiArrowDown,
  FiArrowUp,
  FiChevronDown,
  FiChevronUp,
  FiCreditCard,
  FiDollarSign,
  FiMenu,
  FiPlus,
  FiRepeat,
  FiShield,
  FiSmartphone,
  FiTrendingUp,
} from '../../Components/Icons'
import './index.css'

const MOBILE_QUERY = '(max-width: 780px)'

const MENU = [
  { to: '/', label: 'Portfolio', icon: FiTrendingUp, end: true },
  { to: '/accounts', label: 'Accounts', icon: FiCreditCard },
  { to: '/send', label: 'Send', icon: FiArrowUp },
  { to: '/receive', label: 'Receive', icon: FiArrowDown },
  { to: '/buy-sell', label: 'Buy / Sell', icon: FiDollarSign },
  { to: '/swap', label: 'Swap', icon: FiRepeat },
  { to: '/device', label: 'Device', icon: FiSmartphone },
]

const SECTIONS = [
  { title: 'Menu', items: MENU },
]

const renderIcon = (icon) => (typeof icon === 'function' ? icon() : icon)

function SidebarLink({ to, label, icon, end, onNavigate, className = 'sidebar-link', ...props }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? `${className} active` : className)}
      onClick={onNavigate}
      {...props}
    >
      {renderIcon(icon)}
      {label}
    </NavLink>
  )
}

function SidebarGroup({ label, icon, items = [], defaultOpen, onNavigate }) {
  const { pathname } = useLocation()
  const [toggled, setToggled] = useState(null)

  const hasActiveChild = items.some(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  )
  const open = toggled ?? (defaultOpen || hasActiveChild)

  return (
    <>
      <button
        type="button"
        className={open ? 'sidebar-link sidebar-group open' : 'sidebar-link sidebar-group'}
        onClick={() => setToggled(!open)}
        aria-expanded={open}
      >
        {renderIcon(icon)}
        {label}
        {open ? (
          <FiChevronUp className="sidebar-chevron" />
        ) : (
          <FiChevronDown className="sidebar-chevron" />
        )}
      </button>

      <Collapse in={open}>
        <div>
          {items.map((item) => (
            <SidebarLink
              key={item.to}
              className="sidebar-link sidebar-sublink"
              onNavigate={onNavigate}
              {...item}
            />
          ))}
        </div>
      </Collapse>
    </>
  )
}

function SidebarSection({ title, items = [], action, onAdd, onNavigate }) {
  return (
    <nav className="sidebar-section">
      {(title || action || onAdd) && (
        <div className="sidebar-section-header">
          {title && <p className="sidebar-section-title">{title}</p>}
          {action ||
            (onAdd && (
              <button
                type="button"
                className="sidebar-add"
                onClick={onAdd}
                aria-label={title ? `Add ${title}` : 'Add'}
              >
                <FiPlus />
              </button>
            ))}
        </div>
      )}
      {items.map((item, index) =>
        item.items ? (
          <SidebarGroup key={item.label || index} onNavigate={onNavigate} {...item} />
        ) : (
          <SidebarLink key={item.to} onNavigate={onNavigate} {...item} />
        ),
      )}
    </nav>
  )
}

function Sidebar({
  logo = <FiShield className="sidebar-logo" />,
  brand = 'Admin AUG 2026',
  sections = SECTIONS,
  header,
  footer,
  className,
  ...props
}) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const handleChange = (event) => {
      setIsMobile(event.matches)
      setOpen(false)
    }

    query.addEventListener('change', handleChange)

    return () => query.removeEventListener('change', handleChange)
  }, [])

  const close = () => setOpen(false)

  const panel = (
    <aside className={className ? `sidebar ${className}` : 'sidebar'} {...props}>
      {header || (
        <div className="sidebar-brand">
          {renderIcon(logo)}
          <span className="sidebar-brand-name">{brand}</span>
        </div>
      )}

      {sections.map((section, index) => (
        <SidebarSection
          key={section.title || index}
          onNavigate={isMobile ? close : undefined}
          {...section}
        />
      ))}

      {footer}
    </aside>
  )

  if (!isMobile) return panel

  return (
    <>
      <div className="sidebar-topbar">
        <div className="sidebar-brand p-0 border-0">
          {renderIcon(logo)}
          <span className="sidebar-brand-name">{brand}</span>
        </div>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <FiMenu />
        </button>
      </div>

      <Offcanvas show={open} onHide={close} placement="start" className="sidebar-offcanvas">
        <Offcanvas.Body>{panel}</Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default Sidebar
