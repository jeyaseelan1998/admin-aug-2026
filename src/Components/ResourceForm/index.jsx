import { Button, Card } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Form from '../Form'

// Server-owned fields are never sent back.
const SERVER_FIELDS = ['id', '_id', 'createdAt', 'updatedAt']

const stripServerFields = (record) => {
  const values = { ...record }

  for (const key of SERVER_FIELDS) delete values[key]

  return values
}

const TITLE_PREFIX = { create: 'Create', update: 'Edit', clone: 'Clone', view: '' }

// The shared shell behind /xs/create, /xs/:id, /xs/:id/update and /xs/:id/copy.
export default function ResourceForm({
  mode = 'create',
  title,
  basePath,
  url,
  resource,
  toValues,
  children,
}) {
  const { id } = useParams()
  const navigate = useNavigate()

  const isUpdate = mode === 'update'
  const isView = mode === 'view'

  const parseFetched = (data) => {
    const record = resource ? data[resource] : data
    const values = stripServerFields(toValues ? toValues(record) : record)

    // These resources reject a duplicate name, so a clone arrives with a new one.
    return mode === 'clone' && values.name ? { ...values, name: `${values.name} copy` } : values
  }

  return (
    <Card>
      <Card.Body className="p-4">
        <Card.Title as="h1" className="h4 mb-4">
          {`${TITLE_PREFIX[mode]} ${title}`.trim()}
        </Card.Title>

        <Form
          // A clone reads the record it copies, but posts a new one.
          url={isUpdate || isView ? `${url}/${id}` : url}
          method={isUpdate ? 'PUT' : 'POST'}
          fetchOnMount={Boolean(id)}
          fetchUrl={id ? `${url}/${id}` : undefined}
          parseFetched={parseFetched}
          successMessage={isUpdate ? `${title} updated.` : `${title} created.`}
          onSuccess={() => navigate(basePath)}
        >
          {(formProps) => (
            <>
              {typeof children === 'function' ? children({ ...formProps, mode, isView }) : children}

              {!isView && (
                <Button type="submit" variant="primary" disabled={formProps.submitting} className='ms-auto d-block'>
                  {isUpdate ? 'Update' : 'Create'}
                </Button>
              )}
            </>
          )}
        </Form>
      </Card.Body>
    </Card>
  )
}
