import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
]

export default function Colors() {
  return <List title="Colors" url="/color" columns={columns} empty="No colors yet." />
}
