import { useEffect, useRef, useState } from 'react'
import { Button, Card, Spinner, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiCopy, FiEdit, FiEye, FiPlus, FiTrash, FiTrash2 } from '../Icons'
import api from '../../helpers/axios'
import { resolvePath } from '../../helpers/resolvePath'
import Cell from './Cell'

const resolveMessage = (message, value) =>
  typeof message === 'function' ? message(value) : message

// Paged APIs report the overall count in one of a few usual places.
const resolveTotal = (parsed) =>
  Array.isArray(parsed) ? null : parsed?.total ?? parsed?.meta?.total ?? parsed?.count ?? null

// A preset with `path` navigates under the list's `basePath`; the rest call the API.
const ACTION_PRESETS = {
  VIEW: { label: 'View', variant: 'outline-secondary', icon: <FiEye />, path: (id) => id },
  CLONE: {
    label: 'Clone',
    variant: 'outline-secondary',
    icon: <FiCopy />,
    path: (id) => `clone/${id}`,
  },
  EDIT: { label: 'Edit', variant: 'outline-primary', icon: <FiEdit />, path: (id) => `update/${id}` },
  // Soft delete: the record is flagged, not dropped.
  DELETE: {
    label: 'Delete',
    variant: 'outline-danger',
    method: 'PUT',
    payload: { deleted: 1 },
    confirm: 'Delete this record?',
    remove: true,
    icon: <FiTrash2 />,
  },
  TRASH: {
    label: 'Trash',
    variant: 'danger',
    method: 'DELETE',
    confirm: 'Permanently delete this record? This cannot be undone.',
    remove: true,
    icon: <FiTrash />,
  },
}

// Icon-only by default; pass `showLabel` to sit the text beside it. An action with
// no icon always shows its label, so a custom action never renders an empty button.
const showsLabel = (action) => Boolean(action.showLabel || !action.icon)

const resolveActionPath = (action, row, index, basePath) => {
  if (!action.path) return null

  const id = resolvePath(row, action.idKey || 'id')
  const suffix = typeof action.path === 'function' ? action.path(id, row, index) : action.path

  return suffix == null ? null : [basePath, suffix].filter(Boolean).join('/')
}

// Accepts 'DELETE', ['DELETE', { ...overrides }] or a plain config object.
const normalizeAction = (action) => {
  const [name, overrides] = Array.isArray(action) ? action : [action, null]

  if (typeof name !== 'string') return name

  return { label: name, ...ACTION_PRESETS[name.toUpperCase()], ...overrides }
}

export default function List({
  title,
  basePath,
  createUrl = basePath && `${basePath}/create`,
  columns,
  data,
  url,
  params,
  headers,
  pageSize = 20,
  pageParam = 'page',
  limitParam = 'limit',
  parse,
  actions,
  actionsLabel = 'Actions',
  onError,
  errorMessage,
  toastOnError = true,
  toastOptions,
  empty = 'No records found.',
  ...props
}) {
  // A static array always wins; the url is only used when no data is passed in.
  const isRemote = Boolean(url) && !data

  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(null)
  const [hasMore, setHasMore] = useState(isRemote)
  const [loading, setLoading] = useState(isRemote)

  const items = isRemote ? rows : data || []
  const count = isRemote ? total ?? rows.length : items.length

  // Read inside the effects without making them re-run on every render.
  const latest = useRef(null)

  // Guards against StrictMode's double effect run requesting the same page twice.
  const requestedPage = useRef(0)

  const loadPage = async (nextPage) => {
    if (requestedPage.current >= nextPage) return

    requestedPage.current = nextPage

    const current = latest.current

    // A fresh first page replaces whatever the previous url/params loaded.
    if (nextPage === 1) {
      setRows([])
      setPage(0)
      setTotal(null)
      setHasMore(true)
    }

    setLoading(true)

    try {
      const response = await api({
        url,
        method: 'GET',
        headers: current.headers,
        params: {
          ...current.params,
          [current.pageParam]: nextPage,
          [current.limitParam]: current.pageSize,
        },
      })

      const parsed = current.parse ? current.parse(response.data) : response.data
      const batch = Array.isArray(parsed) ? parsed : parsed?.items || parsed?.data || []

      setRows((previous) => (nextPage === 1 ? batch : [...previous, ...batch]))
      setTotal(resolveTotal(parsed))
      setHasMore(batch.length >= current.pageSize)
      setPage(nextPage)
      setLoading(false)
    } catch (error) {
      const message = error.response?.data?.message || error.message

      // Stop the observer from retrying the same failing page forever.
      setHasMore(false)
      setLoading(false)

      if (current.toastOnError) {
        toast.error(resolveMessage(current.errorMessage, error) || message, current.toastOptions)
      }
      current.onError?.(error)
    }
  }

  // Key of the row/action pair whose request is in flight.
  const [busy, setBusy] = useState(null)

  const runAction = async (action, row, index) => {
    if (action.confirm) {
      const question =
        typeof action.confirm === 'function' ? action.confirm(row, index) : action.confirm

      if (!window.confirm(question === true ? 'Are you sure?' : question)) return
    }

    if (action.onClick) return action.onClick(row, index)

    const actionMethod = (action.method || 'POST').toUpperCase()
    const actionUrl =
      typeof action.url === 'function'
        ? action.url(row, index)
        : action.url || (url && `${url}/${resolvePath(row, action.idKey || 'id')}`)

    if (!actionUrl) return

    const key = `${index}:${action.label}`

    setBusy(key)

    try {
      const response = await api({
        url: actionUrl,
        method: actionMethod,
        headers: { ...headers, ...action.headers },
        ...(actionMethod === 'GET' || actionMethod === 'DELETE'
          ? {}
          : {
              data:
                typeof action.payload === 'function' ? action.payload(row, index) : action.payload,
            }),
      })

      setBusy(null)

      // Remote rows are owned here; a static `data` array stays the parent's to update.
      if (action.remove) {
        setRows((previous) => previous.filter((item) => item !== row))
        setTotal((previous) => (previous == null ? previous : previous - 1))
      }

      if (action.successMessage) {
        toast.success(resolveMessage(action.successMessage, response.data), toastOptions)
      }
      action.onSuccess?.(response.data, row, index)
    } catch (error) {
      const message = error.response?.data?.message || error.message

      setBusy(null)

      if (action.toastOnError ?? toastOnError) {
        toast.error(resolveMessage(action.errorMessage, error) || message, toastOptions)
      }
      action.onError?.(error, row, index)
    }
  }

  useEffect(() => {
    latest.current = {
      params,
      headers,
      pageSize,
      pageParam,
      limitParam,
      parse,
      onError,
      errorMessage,
      toastOnError,
      toastOptions,
      loadPage,
    }
  })

  const paramsKey = JSON.stringify(params ?? null)

  useEffect(() => {
    if (!isRemote) return

    requestedPage.current = 0

    latest.current.loadPage(1)
  }, [isRemote, url, paramsKey])

  const sentinel = useRef(null)

  useEffect(() => {
    if (!isRemote || !hasMore || loading || !sentinel.current) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) latest.current.loadPage(page + 1)
    })

    observer.observe(sentinel.current)

    return () => observer.disconnect()
  }, [isRemote, hasMore, loading, page])

  return (
    <Card>
      <Card.Body className="p-4">
        {title && (
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Card.Title as="h1" className="h4 mb-0">
              {`${title}${count ? `(${count})` : ''}`}
            </Card.Title>

            {createUrl && (
              <Button
                as={Link}
                to={createUrl}
                variant="primary"
                size="sm"
                className="d-inline-flex align-items-center gap-1"
              >
                <FiPlus />
                Create
              </Button>
            )}
          </div>
        )}

        <Table striped hover responsive {...props}>
          <thead>
            <tr>
              {columns.map((column, columnIndex) => (
                <th key={`${column.key}-${columnIndex}`}>{column.label}</th>
              ))}
              {!!actions?.length && <th>{actionsLabel}</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <tr key={row.id ?? index}>
                {columns.map((column, columnIndex) => (
                  <td key={`${column.key}-${columnIndex}`} className='align-middle'>
                    <Cell row={row} column={column} index={index} />
                  </td>
                ))}

                {!!actions?.length && (
                  <td className="text-nowrap">
                    {actions.map(normalizeAction).map((action) => {
                      if (action.hidden?.(row, index)) return null

                      const to = resolveActionPath(action, row, index, basePath)
                      const key = `${index}:${action.label}`

                      return (
                        <Button
                          key={action.label}
                          as={to ? Link : undefined}
                          to={to}
                          variant={action.variant || 'outline-secondary'}
                          size={action.size || 'sm'}
                          className="me-2 d-inline-flex align-items-center gap-1"
                          title={action.label}
                          aria-label={action.label}
                          disabled={busy === key || action.disabled?.(row, index)}
                          onClick={to ? undefined : () => runAction(action, row, index)}
                        >
                          {busy === key ? (
                            <Spinner animation="border" size="sm" role="status">
                              <span className="visually-hidden">Working…</span>
                            </Spinner>
                          ) : (
                            <>
                              {action.icon}
                              {showsLabel(action) && action.label}
                            </>
                          )}
                        </Button>
                      )
                    })}
                  </td>
                )}
              </tr>
            ))}

            {!items.length && !loading && (
              <tr>
                <td
                  colSpan={columns.length + (actions?.length ? 1 : 0)}
                  className="text-center text-muted py-4"
                >
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {loading && (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading…</span>
            </Spinner>
          </div>
        )}

          {isRemote && hasMore && !loading && <div ref={sentinel} />}
      </Card.Body>
    </Card>
  )
}
