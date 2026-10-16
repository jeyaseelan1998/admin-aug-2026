import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role.name', label: 'Role' },
  { key: 'status', label: 'Status', render: (row) => (row.deleted ? 'Deleted' : 'Active') },
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
        ['DELETE', { confirm: (row) => `Delete ${row.name}?`, successMessage: 'User deleted' }],
        'RESTORE',
        'TRASH',
      ]}
    />
  )
}
