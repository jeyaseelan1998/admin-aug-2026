import List from '../../Components/List'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code', copy: true },
  { key: 'code', label: 'Preview', type: 'color' },
]

export default function Colors() {
  return (
    <List
      title="Colors"
      basePath="/colors"
      url="/color"
      columns={columns}
      empty="No colors yet."
      actions={["VIEW", "EDIT", "CLONE", "DELETE", "TRASH"]}
    />
  )
}
