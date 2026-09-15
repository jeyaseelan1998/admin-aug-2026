import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
]

export default function Sizes() {
  return <List title="Sizes" url="/size" columns={columns} empty="No sizes yet." />
}
