import { createElement, useEffect, useRef, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { FiTrash, FiUpload } from '../../../Icons'
import api from '../../../../helpers/axios'
import { fileIcon, isImage } from '../../../../helpers/fileIcon'

const MEDIA_URL = '/media'

// Matches the API's own cap, so a file is turned away before it is sent.
const DEFAULT_MAX_MB = 5

const MB = 1024 * 1024

// Both actions reach past this form: the file is one shared record, so the
// warning goes up before anything happens -- for a replace, before the picker
// opens rather than after a file is chosen.
const REPLACE_WARNING =
  'This file keeps the same id when replaced, and other records may be using it. ' +
  'Anywhere it appears will show the new file, and the current one is gone for good. Continue?'

const DELETE_WARNING =
  'This deletes the file itself, not just its place here, and other records may ' +
  'be using it. Anywhere it appears will be left without it. This cannot be undone. Continue?'

const formatMb = (bytes) => `${(bytes / MB).toFixed(bytes % MB ? 1 : 0)}MB`

// `accept` reads like the input attribute: 'image/*', 'image/png,.webp', …
const matchesAccept = (file, accept) =>
  !accept ||
  accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule)
      if (rule.endsWith('/*')) return file.type.startsWith(rule.slice(0, -1))

      return file.type.toLowerCase() === rule
    })

/**
 * Uploads one file to the media API and keeps its id in the form. Anything the
 * API accepts can be uploaded; an image is previewed, everything else shows the
 * icon for its kind. The bytes live in S3 from the moment they are picked, so
 * removing the file deletes the record for good rather than only detaching it.
 */
export default function FileInput({
  input,
  meta,
  accept,
  maxSizeMb = DEFAULT_MAX_MB,
  height = 180,
  disabled,
  placeholder = 'Upload a file',
  // Whether the field offers to swap its file at all.
  replaceable = true,
  // How a swap is carried out. The safe default uploads a new file and points
  // the field at it, leaving anything else using the old one untouched; opting
  // in rewrites the bytes in place, under the id every record shares.
  overwrite = false,
}) {
  const value = input.value || ''

  // The last record read or uploaded; only shown while the field still points at it.
  const [loaded, setLoaded] = useState(null)
  const [busy, setBusy] = useState('')
  const [rejected, setRejected] = useState('')

  const picker = useRef(null)

  const media = value && loaded?.id === value ? loaded : null

  // A value the form arrived with is only an id, so its preview is read back.
  useEffect(() => {
    if (!value || loaded?.id === value) return

    let active = true

    api
      .get(`${MEDIA_URL}/${value}`)
      .then(({ data }) => {
        const record = data.media ?? data

        if (active) {
          setLoaded({
            id: record.id,
            url: record.url,
            name: record.originalName,
            mimetype: record.mimetype,
          })
        }
      })
      // A missing record leaves the id on show rather than a broken picture.
      .catch(() => {})

    return () => {
      active = false
    }
  }, [value, loaded])

  const reject = (file) => {
    if (!matchesAccept(file, accept)) return `${file.name} is not an accepted file type (${accept}).`
    if (file.size > maxSizeMb * MB) return `${file.name} is ${formatMb(file.size)}, over the ${maxSizeMb}MB limit.`

    return ''
  }

  const upload = async (event) => {
    const file = event.target.files?.[0]

    // Clearing lets the same file be picked again after a removal.
    event.target.value = ''

    if (!file) return

    const problem = reject(file)

    setRejected(problem)

    if (problem) return

    const body = new FormData()

    body.append('file', file)

    setBusy('upload')

    try {
      // An in-place swap rewrites the bytes behind the id the form already
      // holds, so the old file stops existing rather than being orphaned in the
      // bucket; otherwise this is a fresh upload the field then points at.
      // The shared client sends JSON; the boundary has to come from the browser.
      const inPlace = Boolean(value) && replaceable && overwrite

      const { data } = await api({
        url: inPlace ? `${MEDIA_URL}/${value}` : MEDIA_URL,
        method: inPlace ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        data: body,
      })
      const record = data.media ?? data

      setLoaded({
        id: record.id,
        url: record.url,
        name: record.originalName,
        mimetype: record.mimetype,
      })
      input.onChange(record.id)
      input.onBlur()
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || error.message)
    } finally {
      setBusy('')
    }
  }

  const pick = () => picker.current?.click()

  const replace = () => {
    if (!overwrite || window.confirm(REPLACE_WARNING)) pick()
  }

  const remove = async () => {
    if (!window.confirm(DELETE_WARNING)) return

    setBusy('remove')

    try {
      await api.delete(`${MEDIA_URL}/${value}`)

      setLoaded(null)
      setRejected('')
      // Dropping the key entirely, so an empty string never reaches the API.
      input.onChange(undefined)
      input.onBlur()
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || error.message)
    } finally {
      setBusy('')
    }
  }

  const invalid = (meta.touched && Boolean(meta.error)) || Boolean(rejected)

  return (
    <div className={invalid ? 'is-invalid' : ''}>
      <input
        ref={picker}
        type="file"
        accept={accept}
        className="d-none"
        disabled={disabled || Boolean(busy)}
        onChange={upload}
      />

      <div
        className={`p-1 position-relative border rounded overflow-hidden bg-body-secondary ${
          invalid ? 'border-danger' : ''
        }`}
        style={{ height }}
      >
        {value ? (
          <>
            {media?.url && isImage(media.mimetype) ? (
              <img
                src={media.url}
                alt={media.name || 'Selected file'}
                className="w-100 h-100 object-fit-contain"
              />
            ) : (
              <div className="d-flex flex-column h-100 align-items-center justify-content-center gap-2 text-muted small text-break px-3">
                {media ? (
                  <>
                    {createElement(fileIcon(media.mimetype), { size: 28 })}
                    <span className="text-truncate mw-100">{media.name}</span>
                  </>
                ) : (
                  busy !== 'remove' && value
                )}
              </div>
            )}

            {!disabled && (
              <Button
                variant="danger"
                size="sm"
                className="position-absolute top-0 end-0 m-2 d-inline-flex align-items-center"
                title="Delete file"
                aria-label="Delete file"
                disabled={Boolean(busy)}
                onClick={remove}
              >
                {busy === 'remove' ? (
                  <Spinner animation="border" size="sm" role="status">
                    <span className="visually-hidden">Deleting…</span>
                  </Spinner>
                ) : (
                  <FiTrash />
                )}
              </Button>
            )}
          </>
        ) : (
          <button
            type="button"
            className="btn btn-link w-100 h-100 d-flex flex-column align-items-center justify-content-center gap-2 text-decoration-none text-body-secondary"
            disabled={disabled || Boolean(busy)}
            onClick={pick}
          >
            {busy === 'upload' ? (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Uploading…</span>
              </Spinner>
            ) : (
              <>
                <FiUpload size={24} />
                <span>{placeholder}</span>
                <span className="small text-muted">
                  {accept || 'Any file'} · up to {maxSizeMb}MB
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {value && !disabled && (
        <div className="d-flex align-items-center gap-2 mt-2">
          {replaceable && (
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={Boolean(busy)}
              onClick={replace}
            >
              {busy === 'upload' ? 'Uploading…' : 'Replace'}
            </Button>
          )}
          {media?.name && <span className="small text-muted text-truncate">{media.name}</span>}
        </div>
      )}

      {rejected && <div className="small text-danger mt-2">{rejected}</div>}
    </div>
  )
}
