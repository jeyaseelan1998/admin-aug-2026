import { useEffect, useRef, useState } from 'react'
import { Form as BsForm, Spinner } from 'react-bootstrap'
import { FORM_ERROR } from 'final-form'
import { Form as FinalForm } from 'react-final-form'
import { toast } from 'react-toastify'
import api from '../../helpers/axios'

const resolveMessage = (message, value) =>
  typeof message === 'function' ? message(value) : message

export default function Form({
  url,
  method = 'POST',
  fetchOnMount = false,
  fetchUrl,
  parseFetched,
  payload,
  headers,
  initialValues,
  onSuccess,
  onError,
  onSubmit,
  successMessage,
  errorMessage,
  toastOnError = true,
  toastOptions,
  validate,
  children,
  ...props
}) {
  const getUrl = fetchUrl || url
  const shouldFetch = Boolean(fetchOnMount && getUrl)

  const [fetched, setFetched] = useState(null)
  const [loading, setLoading] = useState(shouldFetch)

  // Read inside the fetch effect without making it re-run on every render.
  const latest = useRef(null)

  useEffect(() => {
    latest.current = { headers, parseFetched, onError, errorMessage, toastOnError, toastOptions }
  })

  useEffect(() => {
    if (!shouldFetch) return

    let active = true

    api
      .get(getUrl, { headers: latest.current.headers })
      .then(({ data }) => {
        if (!active) return

        const { parseFetched: parse } = latest.current

        setFetched(parse ? parse(data) : data)
        setLoading(false)
      })
      .catch((error) => {
        if (!active) return

        const current = latest.current
        const message = error.response?.data?.message || error.message

        setLoading(false)

        if (current.toastOnError) {
          toast.error(resolveMessage(current.errorMessage, error) || message, current.toastOptions)
        }
        current.onError?.(error)
      })

    return () => {
      active = false
    }
  }, [shouldFetch, getUrl])

  const handleSubmit = async (values, form) => {
    if (!url) return onSubmit?.(values, form)

    try {
      const { data } = await api({
        url,
        method,
        headers,
        data: { ...payload, ...values },
      })

      if (successMessage) {
        toast.success(resolveMessage(successMessage, data), toastOptions)
      }
      onSuccess?.(data, values)
    } catch (error) {
      const message = error.response?.data?.message || error.message

      if (toastOnError) {
        toast.error(resolveMessage(errorMessage, error) || message, toastOptions)
      }
      onError?.(error)

      return { [FORM_ERROR]: message }
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading…</span>
        </Spinner>
      </div>
    )
  }

  return (
    <FinalForm
      onSubmit={handleSubmit}
      validate={validate}
      initialValues={fetched ?? initialValues}
      {...props}
      render={(formProps) => (
        <BsForm noValidate onSubmit={formProps.handleSubmit}>
          {typeof children === 'function' ? children(formProps) : children}
        </BsForm>
      )}
    />
  )
}
