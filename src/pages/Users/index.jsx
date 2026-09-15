import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
]

export default function Users() {
  return (
    <List
      title="Users"
      url="/users"
      columns={columns}
      empty="No users yet."
      actions={[
        ['DELETE', { confirm: (row) => `Delete ${row.name}?`, successMessage: 'User deleted' }],
      ]}
    />
  )
}
