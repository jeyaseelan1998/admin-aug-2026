import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'link', label: 'Link' },
]

export default function Socials() {
  return <List title="Socials" url="/social" columns={columns} empty="No socials yet." />
}
