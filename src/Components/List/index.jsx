import { useEffect, useRef, useState } from 'react'
import { Button, Card, Spinner, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import api from '../../helpers/axios'

const resolveMessage = (message, value) =>
  typeof message === 'function' ? message(value) : message

// Supports dotted paths into nested objects and arrays, e.g. 'address.0.city'.
const resolvePath = (row, path) =>
  String(path)
    .split('.')
    .reduce((value, segment) => (value == null ? undefined : value[segment]), row)

const resolveCell = (row, column, index) =>
  column.render ? column.render(row, index) : resolvePath(row, column.key)

// Paged APIs report the overall count in one of a few usual places.
const resolveTotal = (parsed) =>
  Array.isArray(parsed) ? null : parsed?.total ?? parsed?.meta?.total ?? parsed?.count ?? null

const ACTION_PRESETS = {
  VIEW: { label: 'View', variant: 'outline-secondary', method: 'GET' },
  CREATE: { label: 'Create', variant: 'outline-success', method: 'POST' },
  EDIT: { label: 'Edit', variant: 'outline-primary', method: 'PUT' },
  UPDATE: { label: 'Update', variant: 'outline-primary', method: 'PATCH' },
  DELETE: {
    label: 'Delete',
    variant: 'outline-danger',
    method: 'DELETE',
    confirm: 'Delete this record?',
    remove: true,
  },
}

// Accepts 'DELETE', ['DELETE', { ...overrides }] or a plain config object.
const normalizeAction = (action) => {
  const [name, overrides] = Array.isArray(action) ? action : [action, null]

  if (typeof name !== 'string') return name

  return { label: name, ...ACTION_PRESETS[name.toUpperCase()], ...overrides }
}

export default function List({
  title,
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
          <Card.Title as="h1" className="h4 mb-4">
            {`${title}${count ? `(${count})` : ''}`}
          </Card.Title>
        )}

        <Table striped hover responsive {...props}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              {!!actions?.length && <th>{actionsLabel}</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <tr key={row.id ?? index}>
                {columns.map((column) => (
                  <td key={column.key}>{resolveCell(row, column, index)}</td>
                ))}

                {!!actions?.length && (
                  <td className="text-nowrap">
                    {actions.map(normalizeAction).map((action) =>
                      action.hidden?.(row, index) ? null : (
                        <Button
                          key={action.label}
                          variant={action.variant || 'outline-secondary'}
                          size={action.size || 'sm'}
                          className="me-2"
                          disabled={busy === `${index}:${action.label}` || action.disabled?.(row, index)}
                          onClick={() => runAction(action, row, index)}
                        >
                          {busy === `${index}:${action.label}` ? (
                            <Spinner animation="border" size="sm" role="status">
                              <span className="visually-hidden">Working…</span>
                            </Spinner>
                          ) : (
                            action.label
                          )}
                        </Button>
                      ),
                    )}
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
