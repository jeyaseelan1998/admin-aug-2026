import { Badge } from 'react-bootstrap'
import List from '../../Components/List'
import { FiActivity, FiLogOut } from '../../Components/Icons'
import { timeAgo } from '../../helpers/date'

// `status` is worked out by the API: online means seen in the last few minutes.
const renderStatus = (row) =>
  row.status === 'online' ? (
    <Badge bg="success">Online</Badge>
  ) : (
    <span className="text-muted small">
      {row.lastSeenAt ? `Last seen ${timeAgo(row.lastSeenAt)}` : 'Offline'}
    </span>
  )

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role.name', label: 'Role' },
  { key: 'status', label: 'Status', render: renderStatus },
]

// No clone: emails are unique and a password cannot be copied.
export default function Users() {
  return (
    <List
        title="Users"
        basePath="/users"
        url="/users"
        columns={columns}
        empty="No users yet."
        actions={[
          'VIEW',
          'EDIT',
          {
            label: 'Login history',
            icon: <FiActivity />,
            variant: 'outline-secondary',
            // Opens the view page straight on its login history tab.
            path: (id) => `${id}?tab=history`,
          },
          {
            label: 'Log out',
            icon: <FiLogOut />,
            variant: 'outline-warning',
            method: 'PATCH',
            urlSuffix: 'logout',
            confirm: (row) => `Log ${row.name} out of every device? They will have to sign in again.`,
            successMessage: (data) => `${data.user.name} has been logged out`,
            // The row shows offline straight away, without reloading the list.
            patch: { status: 'offline', lastSeenAt: null },
            hidden: (row) => row.deleted === 1,
          },
          ['DELETE', { confirm: (row) => `Delete ${row.name}?`, successMessage: 'User deleted' }],
          'RESTORE',
          'TRASH',
        ]}
    />
  )
}
