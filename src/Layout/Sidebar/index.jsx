import { useEffect, useState } from 'react'
import { Collapse, Offcanvas } from 'react-bootstrap'
import { NavLink, useLocation } from 'react-router-dom'

import {
  FiChevronDown,
  FiChevronUp,
  FiMenu,
  FiPlus,
  FiShield,
} from '../../Components/Icons'
import SECTIONS from './menu'
import './index.css'

const MOBILE_QUERY = '(max-width: 780px)'

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

// A menu item with no `to` runs an action (logout, a modal) instead of navigating.
function SidebarAction({ label, icon, onClick, onNavigate, className = 'sidebar-link', ...props }) {
  return (
    <button
      type="button"
      className={`${className} sidebar-group`}
      onClick={() => {
        onNavigate?.()
        onClick?.()
      }}
      {...props}
    >
      {renderIcon(icon)}
      {label}
    </button>
  )
}

function SidebarGroup({ label, icon, items = [], defaultOpen, onNavigate }) {
  const { pathname } = useLocation()

  // Tied to the route it was made on, so navigating away drops the manual
  // toggle and the group falls back to "open only while a child is active".
  const [toggled, setToggled] = useState(null)

  const hasActiveChild = items.some(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  )
  const open =
    toggled?.pathname === pathname ? toggled.open : defaultOpen || hasActiveChild

  return (
    <>
      <button
        type="button"
        className={open ? 'sidebar-link sidebar-group open' : 'sidebar-link sidebar-group'}
        onClick={() => setToggled({ pathname, open: !open })}
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
      {items.map((item, index) => {
        if (item.items) {
          return <SidebarGroup key={item.label || index} onNavigate={onNavigate} {...item} />
        }

        return item.to ? (
          <SidebarLink key={item.to} onNavigate={onNavigate} {...item} />
        ) : (
          <SidebarAction key={item.label || index} onNavigate={onNavigate} {...item} />
        )
      })}
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
