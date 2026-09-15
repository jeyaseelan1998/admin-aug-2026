import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
]

export default function Categories() {
  return <List title="Categories" url="/category" columns={columns} empty="No categories yet." />
}
