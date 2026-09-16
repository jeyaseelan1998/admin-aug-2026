import { Fragment, useEffect, useRef, useState } from 'react'
import { Button, Card, Spinner, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiCopy, FiEdit, FiEye, FiPlus, FiRepeat, FiTrash, FiX } from '../Icons'
import api from '../../helpers/axios'
import { resolvePath } from '../../helpers/resolvePath'
import Cell from './Cell'

const resolveMessage = (message, value) =>
  typeof message === 'function' ? message(value) : message

// Paged APIs report the overall count in one of a few usual places.
const resolveTotal = (parsed) =>
  Array.isArray(parsed) ? null : parsed?.total ?? parsed?.meta?.total ?? parsed?.count ?? null

// The soft-delete flag the API sets; a flagged row is shown greyed out.
const ACTIVE = 0
const DELETED = 1

// A preset with `path` navigates under the list's `basePath`; the rest call the API.
const ACTION_PRESETS = {
  VIEW: { label: 'View', variant: 'outline-secondary', icon: <FiEye />, path: (id) => id },
  CLONE: {
    label: 'Clone',
    variant: 'outline-secondary',
    icon: <FiCopy />,
    path: (id) => `${id}/copy`,
  },
  EDIT: {
    label: 'Edit',
    variant: 'outline-primary',
    icon: <FiEdit />,
    path: (id) => `${id}/update`,
  },
  // Soft delete: the record is flagged, not dropped. Every resource exposes it
  // at its own PATCH /:id/delete, which takes no body. The row stays in the
  // list, flagged, so only the permanent delete is offered from then on.
  DELETE: {
    label: 'Delete',
    variant: 'outline-danger',
    method: 'PATCH',
    urlSuffix: 'delete',
    confirm: 'Delete this record?',
    patch: { deleted: DELETED },
    icon: <FiX />,
    hidden: (row) => row.deleted === DELETED,
  },
  // Restore: clears the flag the soft delete set, at the mirror of its route.
  RESTORE: {
    label: 'Restore',
    variant: 'outline-success',
    method: 'PATCH',
    urlSuffix: 'restore',
    patch: { deleted: ACTIVE },
    icon: <FiRepeat />,
    hidden: (row) => row.deleted !== DELETED,
  },
  TRASH: {
    label: 'Trash',
    variant: 'outline-danger',
    method: 'DELETE',
    confirm: 'Permanently delete this record? This cannot be undone.',
    remove: true,
    icon: <FiTrash />,
    hidden: (row) => row.deleted !== DELETED,
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
  columns = [],
  // Draws one row as custom markup instead of a table row, so a list can be a
  // gallery, a card deck, anything: `(row, { index, actions }) => jsx`, where
  // `actions` is the same buttons the table renders, for the item to place.
  renderItem,
  // Classes for the element wrapping the custom items — the layout itself.
  itemsClassName = 'row g-3',
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
        : action.url ||
          (url &&
            [url, resolvePath(row, action.idKey || 'id'), action.urlSuffix].filter(Boolean).join('/'))

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
      } else if (action.patch) {
        setRows((previous) =>
          previous.map((item) => (item === row ? { ...item, ...action.patch } : item))
        )
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

  const renderActions = (row, index) =>
    !actions?.length ? null : (
      <>
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
      </>
    )

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

        {renderItem ? (
          <div className={itemsClassName} {...props}>
            {items.map((row, index) => (
              <Fragment key={row.id ?? index}>
                {renderItem(row, { index, actions: renderActions(row, index) })}
              </Fragment>
            ))}
          </div>
        ) : (
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
                    <td
                      key={`${column.key}-${columnIndex}`}
                      className={`align-middle ${row.deleted === DELETED ? 'text-muted opacity-50' : ''}`}
                    >
                      <Cell row={row} column={column} index={index} />
                    </td>
                  ))}

                  {!!actions?.length && (
                    <td className="text-nowrap">{renderActions(row, index)}</td>
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
        )}

        {renderItem && !items.length && !loading && (
          <div className="text-center text-muted py-4">{empty}</div>
        )}

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
