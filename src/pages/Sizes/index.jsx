import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
]

export default function Sizes() {
  return (
    <List
      title="Sizes"
      basePath="/sizes"
      url="/size"
      columns={columns}
      empty="No sizes yet."
      actions={['VIEW', 'EDIT', 'CLONE', 'DELETE', 'RESTORE', 'TRASH']}
    />
  )
}
