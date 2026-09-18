import { Badge } from 'react-bootstrap'
import List from '../../Components/List'

const PUBLISHED = 1

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'slug', label: 'Slug', copy: true },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <Badge bg={row.status === PUBLISHED ? 'success' : 'secondary'}>
        {row.status === PUBLISHED ? 'Published' : 'Draft'}
      </Badge>
    ),
  },
  { key: 'widgets', label: 'Widgets', render: (row) => row.widgets?.length ?? 0 },
]

export default function Pages() {
  return (
    <List
      title="Pages"
      basePath="/pages"
      url="/page"
      columns={columns}
      empty="No pages yet."
      // No clone: a copy would carry the slug of the page it came from, and the
      // API holds slugs unique.
      actions={['VIEW', 'EDIT', 'DELETE', 'RESTORE', 'TRASH']}
    />
  )
}
