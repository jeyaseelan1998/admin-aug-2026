import { Badge } from 'react-bootstrap'
import List from '../../Components/List'
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
export default function LoginHistory({ userId }) {
  return (
    <List url={`/users/${userId}/login-history`} columns={columns} empty="No sign-ins yet." />
  )
}
