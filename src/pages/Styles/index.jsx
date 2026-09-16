import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
]

export default function Styles() {
  return (
    <List
      title="Styles"
      basePath="/styles"
      url="/style"
      columns={columns}
      empty="No styles yet."
      actions={['VIEW', 'EDIT', 'CLONE', 'DELETE', 'RESTORE', 'TRASH']}
    />
  )
}
