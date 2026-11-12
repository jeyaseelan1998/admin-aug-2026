import { Badge } from 'react-bootstrap'
import List from '../../Components/List'
import { FiLogOut } from '../../Components/Icons'
import { formatDateTime } from '../../helpers/date'

// The API and admin running on the same machine sign in from a loopback address.
const LOOPBACK = ['::1', '127.0.0.1']

const formatIp = (ip) => {
  if (!ip) return '—'

  return LOOPBACK.includes(ip) ? (
    <span title={ip}>
      Localhost <span className="text-muted small">({ip})</span>
    </span>
  ) : (
    ip
  )
}

const SCOPE_LABEL = { web: 'Website', cms: 'CMS' }

const REASON_LABEL = {
  invalid_password: 'Wrong password',
  not_admin: 'Not an admin',
}

const ENDED_BY_LABEL = { user: 'Signed out', admin: 'Logged out by admin' }

// A successful sign-in is a session: still active, ended early, or expired.
const renderSession = (row) => {
  if (!row.success) return <span className="text-muted">—</span>

  if (row.active) {
    return (
      <span className="d-inline-flex gap-1">
        <Badge bg="primary">Active</Badge>
        {row.current && <Badge bg="info">This device</Badge>}
      </span>
    )
  }

  return (
    <span className="text-muted small" title={row.endedAt ? formatDateTime(row.endedAt) : undefined}>
      {ENDED_BY_LABEL[row.endedBy] ?? 'Expired'}
    </span>
  )
}

const columns = [
  { key: 'createdAt', label: 'When', render: (row) => formatDateTime(row.createdAt) },
  { key: 'scope', label: 'Where', render: (row) => SCOPE_LABEL[row.scope] ?? row.scope },
  {
    key: 'success',
    label: 'Result',
    render: (row) =>
      row.success ? (
        <Badge bg="success">Signed in</Badge>
      ) : (
        <Badge bg="danger">{REASON_LABEL[row.reason] ?? 'Failed'}</Badge>
      ),
  },
  { key: 'session', label: 'Session', render: (row) => renderSession(row) },
  { key: 'ip', label: 'IP', render: (row) => formatIp(row.ip) },
  {
    key: 'userAgent',
    label: 'Device',
    // User agents run long; the full string is in the tooltip.
    render: (row) => (
      <span className="d-inline-block text-truncate small" style={{ maxWidth: 260 }} title={row.userAgent ?? ''}>
        {row.userAgent ?? '—'}
      </span>
    ),
  },
]

// Every sign-in attempt on one account, newest first, loading more on scroll.
// Active sessions can be ended one device at a time.
export default function LoginHistory({ userId }) {
  const actions = [
    {
      label: 'Log out device',
      icon: <FiLogOut />,
      variant: 'outline-warning',
      method: 'PATCH',
      url: (row) => `/users/${userId}/sessions/${row.id}/logout`,
      confirm: 'Log this device out? Other devices stay signed in.',
      successMessage: 'Device logged out',
      // The row shows the session ended straight away, without a reload.
      patch: { active: false, endedBy: 'admin' },
      // Your own current session is ended with Logout in the menu instead.
      hidden: (row) => !row.active || row.current,
    },
  ]

  return (
    <List
      url={`/users/${userId}/login-history`}
      columns={columns}
      actions={actions}
      empty="No sign-ins yet."
    />
  )
}
