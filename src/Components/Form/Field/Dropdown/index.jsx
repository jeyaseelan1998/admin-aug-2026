import { useEffect, useMemo, useRef, useState } from 'react'
import { Form as BsForm, Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { FiChevronDown, FiX } from '../../../Icons'
import api from '../../../../helpers/axios'

// One page of lookup rows; the search panel pulls the next as it is scrolled.
const PAGE_SIZE = 20

// Without search there is no panel to scroll, so the whole list is read up
// front, in as few round trips as the API's page cap allows.
const BULK_SIZE = 100

// Accepts 'red', { value, label } or a raw record like { id, name }.
const toOption = (item) =>
  item !== null && typeof item === 'object'
    ? { value: item.value ?? item.id, label: String(item.label ?? item.name ?? item.value ?? item.id) }
    : { value: item, label: String(item) }

// A record read on its own arrives wrapped under its resource name, e.g. { style: {...} }.
const unwrapRecord = (data) => {
  if (!data || typeof data !== 'object') return data
  if (data.id !== undefined || data.value !== undefined) return data

  const [first] = Object.values(data)

  return first && typeof first === 'object' ? first : data
}

const key = (value) => String(value)

// Options either arrive as an array or are read from the API a page at a time.
const useOptions = (url, paramsKey, parseOptions, searchable) => {
  const [loaded, setLoaded] = useState({ items: [], page: 0, hasMore: Boolean(url), loading: Boolean(url) })

  // Read on each run, like the other data components' callbacks.
  const parse = useRef(parseOptions)

  useEffect(() => {
    parse.current = parseOptions
  })

  // Guards against StrictMode's double effect run requesting the same page twice.
  const requested = useRef({ paramsKey: null, page: 0 })

  const loadPage = async (nextPage) => {
    if (!url) return
    if (requested.current.paramsKey === paramsKey && requested.current.page >= nextPage) return

    requested.current = { paramsKey, page: nextPage }

    setLoaded((previous) =>
      nextPage === 1
        ? { items: [], page: 0, hasMore: true, loading: true }
        : { ...previous, loading: true }
    )

    try {
      const { data } = await api.get(url, {
        params: {
          page: nextPage,
          limit: searchable ? PAGE_SIZE : BULK_SIZE,
          ...JSON.parse(paramsKey),
        },
      })
      const batch = parse.current ? parse.current(data) : data.items || data.data || data

      setLoaded((previous) => ({
        items: nextPage === 1 ? batch : [...previous.items, ...batch],
        page: nextPage,
        hasMore: batch.length >= (searchable ? PAGE_SIZE : BULK_SIZE),
        loading: false,
      }))
    } catch (error) {
      // Stop the observer from retrying the same failing page forever.
      setLoaded((previous) => ({ ...previous, hasMore: false, loading: false }))
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const latest = useRef(null)

  useEffect(() => {
    latest.current = { loadPage }
  })

  useEffect(() => {
    if (!url) return

    requested.current = { paramsKey: null, page: 0 }
    latest.current.loadPage(1)
  }, [url, paramsKey])

  // Nothing triggers the next page without a panel, so they chain themselves.
  useEffect(() => {
    if (!url || searchable || !loaded.page || loaded.loading || !loaded.hasMore) return

    latest.current.loadPage(loaded.page + 1)
  }, [url, searchable, loaded.page, loaded.loading, loaded.hasMore])

  return { ...loaded, loadMore: () => latest.current.loadPage(loaded.page + 1) }
}

/**
 * A value the form arrived with may sit on a page that was never loaded, so its
 * label is read from the record's own endpoint. Only ids still missing after a
 * page lands are fetched, and each one only once.
 */
const useMissingLabels = (url, values, byValue) => {
  const [labels, setLabels] = useState({})

  const asked = useRef(new Set())

  const missingKey = values
    .filter((value) => value != null && !byValue.has(key(value)) && labels[key(value)] === undefined)
    .map(key)
    .join(',')

  useEffect(() => {
    if (!url || !missingKey) return

    let active = true

    for (const value of missingKey.split(',')) {
      if (asked.current.has(value)) continue

      asked.current.add(value)

      api
        .get(`${url}/${value}`)
        .then(({ data }) => {
          if (!active) return

          const option = toOption(unwrapRecord(data))

          setLabels((previous) => ({ ...previous, [value]: option.label }))
        })
        // A value with no record behind it falls back to showing itself.
        .catch(() => {})
    }

    return () => {
      active = false
    }
  }, [url, missingKey])

  return labels
}

function SearchSelect({
  input,
  meta,
  all,
  remote,
  url,
  multiple,
  placeholder,
  disabled,
  values,
  labelOf,
  searchable,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(0)

  const isSelected = (value) => values.some((selected) => key(selected) === key(value))

  // A picked option is already shown in the control, so the list drops it.
  const available = all.filter((option) => !isSelected(option.value))

  const query = search.trim().toLowerCase()
  const filtered = query
    ? available.filter((option) => option.label.toLowerCase().includes(query))
    : available

  const root = useRef(null)
  const sentinel = useRef(null)

  const close = () => {
    setOpen(false)
    setSearch('')
    // Closing is what marks the field touched, so validation can show.
    input.onBlur()
  }

  // A short filtered list leaves the sentinel in view, so pages keep arriving
  // until the search finds matches or the collection runs out.
  useEffect(() => {
    if (!open || !url || !searchable || !remote.hasMore || remote.loading || !sentinel.current) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) remote.loadMore()
    })

    observer.observe(sentinel.current)

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, url, searchable, remote.hasMore, remote.loading, remote.page, filtered.length])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event) => {
      if (!root.current?.contains(event.target)) close()
    }

    document.addEventListener('mousedown', onPointerDown)

    return () => document.removeEventListener('mousedown', onPointerDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const toggle = (option) => {
    if (!multiple) {
      input.onChange(option.value)
      close()
      return
    }

    input.onChange(
      isSelected(option.value)
        ? values.filter((selected) => key(selected) !== key(option.value))
        : [...values, option.value]
    )
  }

  const remove = (event, value) => {
    event.stopPropagation()
    input.onChange(multiple ? values.filter((selected) => key(selected) !== key(value)) : '')
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      close()
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()

      if (!open) {
        setOpen(true)
        return
      }

      const step = event.key === 'ArrowDown' ? 1 : -1

      setActive((previous) => Math.min(Math.max(previous + step, 0), Math.max(filtered.length - 1, 0)))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()

      if (!open) setOpen(true)
      else if (filtered[active]) toggle(filtered[active])
    }
  }

  const invalid = meta.touched && Boolean(meta.error)

  return (
    <div className={`position-relative ${invalid ? 'is-invalid' : ''}`} ref={root}>
      <div
        className={`form-control d-flex align-items-center gap-1 flex-wrap ${invalid ? 'is-invalid' : ''} ${
          disabled ? 'bg-body-secondary' : ''
        }`}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen((previous) => !previous)}
        onKeyDown={disabled ? undefined : onKeyDown}
      >
        {!values.length && <span className="text-muted">{placeholder || 'Select…'}</span>}

        {multiple
          ? values.map((value) => (
              <span
                key={key(value)}
                className="badge text-bg-secondary d-inline-flex align-items-center gap-1"
              >
                {labelOf(value)}
                {!disabled && (
                  <FiX role="button" aria-label="Remove" onClick={(event) => remove(event, value)} />
                )}
              </span>
            ))
          : Boolean(values.length) && <span className="text-truncate">{labelOf(values[0])}</span>}

        <span className="ms-auto d-inline-flex align-items-center gap-2 text-muted">
          {!multiple && !!values.length && !disabled && (
            <FiX role="button" aria-label="Clear" onClick={(event) => remove(event, values[0])} />
          )}
          <FiChevronDown />
        </span>
      </div>

      {open && !disabled && (
        <div
          className="position-absolute top-100 start-0 w-100 mt-1 bg-body border rounded shadow-sm z-3 overflow-auto"
          style={{ maxHeight: '16rem' }}
        >
          {searchable && (
            <div className="p-2 border-bottom position-sticky top-0 bg-body">
              <input
                className="form-control form-control-sm"
                value={search}
                placeholder="Search…"
                autoFocus
                onChange={(event) => {
                  setSearch(event.target.value)
                  setActive(0)
                }}
                onKeyDown={onKeyDown}
              />
            </div>
          )}

          <ul className="list-unstyled mb-0 py-1" role="listbox">
            {filtered.map((option, index) => (
              <li key={key(option.value)}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  className={`dropdown-item text-truncate ${index === active ? 'active' : ''}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => toggle(option)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>

          {remote.loading && (
            <div className="d-flex justify-content-center py-2">
              <Spinner animation="border" size="sm" role="status">
                <span className="visually-hidden">Loading…</span>
              </Spinner>
            </div>
          )}

          {!filtered.length && !remote.loading && (
            <div className="px-3 py-2 text-muted small">
              {all.length && !query ? 'All options selected' : 'No options'}
            </div>
          )}

          {url && searchable && remote.hasMore && !remote.loading && <div ref={sentinel} />}
        </div>
      )}
    </div>
  )
}

export default function Dropdown({
  input,
  meta,
  options,
  url,
  params,
  parseOptions,
  multiple,
  placeholder,
  disabled,
  // Off by default: a plain select over the whole list, with no search box.
  searchable = false,
  ...props
}) {
  const paramsKey = JSON.stringify(params ?? null)
  const remote = useOptions(url, paramsKey, parseOptions, searchable)

  const all = useMemo(
    () => ((url ? remote.items : options) || []).map(toOption),
    [url, remote.items, options]
  )
  const byValue = useMemo(() => new Map(all.map((option) => [key(option.value), option])), [all])

  // final-form holds '' before anything is picked, and an array for a multiple.
  const values = multiple
    ? Array.isArray(input.value)
      ? input.value
      : input.value
        ? [input.value]
        : []
    : input.value === '' || input.value == null
      ? []
      : [input.value]

  // A native select only ever shows options it loaded, so it needs no lookups.
  const asCombobox = multiple || searchable

  const missingLabels = useMissingLabels(asCombobox ? url : null, values, byValue)

  const labelOf = (value) => byValue.get(key(value))?.label ?? missingLabels[key(value)] ?? key(value)

  if (!asCombobox) {
    return (
      <BsForm.Select
        {...input}
        // React requires an array behind a multiple select; final-form starts at ''.
        value={multiple ? input.value || [] : input.value}
        multiple={multiple}
        disabled={disabled}
        {...props}
        isInvalid={meta.touched && !!meta.error}
      >
        {!multiple && <option value="">{remote.loading ? 'Loading…' : placeholder || '\u2014'}</option>}

        {all.map((option) => (
          <option key={key(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </BsForm.Select>
    )
  }

  return (
    <SearchSelect
      input={input}
      meta={meta}
      all={all}
      remote={remote}
      url={url}
      multiple={multiple}
      placeholder={placeholder}
      disabled={disabled}
      values={values}
      labelOf={labelOf}
      searchable={searchable}
    />
  )
}
