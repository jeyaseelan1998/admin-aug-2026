import { useEffect, useState } from 'react'
import { Form as BsForm } from 'react-bootstrap'
import { toast } from 'react-toastify'
import api from '../../../../helpers/axios'

// A lookup list is read in one go; the API caps a page at 100 rows.
const OPTIONS_LIMIT = 100

// Accepts 'red', { value, label } or a raw record like { id, name }.
const toOption = (item) =>
  item !== null && typeof item === 'object'
    ? { value: item.value ?? item.id, label: item.label ?? item.name }
    : { value: item, label: String(item) }

// Options either arrive as an array or are read from the API by url.
const useOptions = (url, params, parseOptions) => {
  // The url the options in state belong to, so a change reads as loading without an effect.
  const [loaded, setLoaded] = useState({ url: null, options: [] })

  const paramsKey = JSON.stringify(params ?? null)

  useEffect(() => {
    if (!url) return

    let active = true

    api
      .get(url, { params: { limit: OPTIONS_LIMIT, ...JSON.parse(paramsKey) } })
      .then(({ data }) => {
        if (!active) return

        setLoaded({ url, options: parseOptions ? parseOptions(data) : data.items || data.data || data })
      })
      .catch((error) => {
        if (!active) return

        setLoaded({ url, options: [] })
        toast.error(error.response?.data?.message || error.message)
      })

    return () => {
      active = false
    }
    // parseOptions is read on each run, like the other data components' callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, paramsKey])

  return { options: loaded.options, loading: Boolean(url) && loaded.url !== url }
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
  ...props
}) {
  const fetched = useOptions(url, params, parseOptions)

  const items = (url ? fetched.options : options) || []

  return (
    <BsForm.Select
      {...input}
      // React requires an array behind a multiple select; final-form starts at ''.
      value={multiple ? input.value || [] : input.value}
      multiple={multiple}
      {...props}
      isInvalid={meta.touched && !!meta.error}
    >
      {!multiple && <option value="">{fetched.loading ? 'Loading…' : placeholder || '—'}</option>}

      {items.map(toOption).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </BsForm.Select>
  )
}
