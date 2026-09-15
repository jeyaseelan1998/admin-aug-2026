import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
]

export default function Brands() {
  return <List title="Brands" url="/brand" columns={columns} empty="No brands yet." />
}
