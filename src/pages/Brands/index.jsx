import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
]

export default function Brands() {
  return (
    <List
      title="Brands"
      basePath="/brands"
      url="/brand"
      columns={columns}
      empty="No brands yet."
      actions={['VIEW', 'EDIT', 'CLONE', 'DELETE']}
    />
  )
}
