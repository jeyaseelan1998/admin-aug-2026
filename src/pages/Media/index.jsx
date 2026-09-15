import List from '../../Components/List'

const columns = [
  { key: 'originalName', label: 'File' },
  { key: 'mimetype', label: 'Type' },
  { key: 'size', label: 'Size' },
]

export default function Media() {
  return <List title="Media" url="/media" columns={columns} empty="No media yet." />
}
