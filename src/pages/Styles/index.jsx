import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
]

export default function Styles() {
  return <List title="Styles" url="/style" columns={columns} empty="No styles yet." />
}
