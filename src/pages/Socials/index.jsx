import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'link', label: 'Link' },
]

export default function Socials() {
  return (
    <List
      title="Socials"
      basePath="/socials"
      url="/social"
      columns={columns}
      empty="No socials yet."
      actions={['VIEW', 'EDIT', 'CLONE', 'DELETE', 'RESTORE', 'TRASH']}
    />
  )
}
