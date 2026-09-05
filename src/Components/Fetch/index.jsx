import { useEffect, useRef, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import api from '../../helpers/axios'

const resolveMessage = (message, value) =>
  typeof message === 'function' ? message(value) : message

// A click handler passes its event as the first argument; ignore it.
const isEvent = (value) => Boolean(value && typeof value.preventDefault === 'function')

export default function Fetch({
  url,
  method = 'GET',
  fetchOnMount,
  params,
  payload,
  headers,
  parse,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  toastOnError = true,
  toastOptions,
  skeleton,
  render,
}) {
  const isGet = method.toUpperCase() === 'GET'
  const shouldFetchOnMount = Boolean(url) && (fetchOnMount ?? isGet)

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(shouldFetchOnMount)

  const fetch = async (overrides) => {
    const options = isEvent(overrides) ? {} : overrides || {}
    const requestMethod = options.method || method

    setLoading(true)

    try {
      const response = await api({
        url: options.url || url,
        method: requestMethod,
        headers: { ...headers, ...options.headers },
        params: { ...params, ...options.params },
        ...(requestMethod.toUpperCase() === 'GET'
          ? {}
          : { data: { ...payload, ...options.data } }),
      })

      const parsed = parse ? parse(response.data) : response.data

      setData(parsed)
      setError(null)
      setLoading(false)

      if (successMessage) {
        toast.success(resolveMessage(successMessage, parsed), toastOptions)
      }
      onSuccess?.(parsed, response)

      return parsed
    } catch (requestError) {
      const message = requestError.response?.data?.message || requestError.message

      setError(requestError)
      setLoading(false)

      if (toastOnError) {
        toast.error(resolveMessage(errorMessage, requestError) || message, toastOptions)
      }
      onError?.(requestError)

      return undefined
    }
  }

  // Read inside the mount effect without making it re-run on every render.
  const latest = useRef(null)

  // Guards against StrictMode's double effect run firing the request twice.
  const fetchedUrl = useRef(null)

  useEffect(() => {
    latest.current = { fetch }
  })

  useEffect(() => {
    if (!shouldFetchOnMount || fetchedUrl.current === url) return

    fetchedUrl.current = url
    latest.current.fetch()
  }, [shouldFetchOnMount, url])

  if (loading && shouldFetchOnMount && data === null && error === null) {
    if (skeleton) return typeof skeleton === 'function' ? skeleton() : skeleton

    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading…</span>
        </Spinner>
      </div>
    )
  }

  return typeof render === 'function' ? render({ data, error, loading, fetch }) : render
}
