import { createElement, useEffect, useRef, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { FiPlus, FiTrash, FiUpload, FiX } from '../../../Icons'
import api from '../../../../helpers/axios'
import { fileIcon, isImage, matchesAccept } from '../../../../helpers/file'
import MediaPicker from './Picker'

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

const toIds = (value) => (Array.isArray(value) ? value : value ? [value] : [])

/**
 * Holds media by id: uploads new files, or picks ones already in the library.
 * An image is previewed, anything else shows the icon for its kind.
 *
 * The bytes live in S3 from the moment they are picked, and the record is
 * shared, so this only ever lets go of a file rather than destroying it --
 * unless `hardDelete` or `overwrite` says otherwise.
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
  // Holds a list of ids rather than one.
  multiple = false,
  // Offers what is already in the media library, alongside uploading.
  allowExisting = true,
  // What the corner button does. By default it only detaches the file from
  // this field, leaving the record for other forms and the media library;
  // opting in deletes the file itself, everywhere, for good.
  hardDelete = false,
}) {
  const values = toIds(input.value)

  // id -> record, for previews. Uploads and picks fill it without a round trip.
  const [records, setRecords] = useState({})
  const [busy, setBusy] = useState('')
  const [rejected, setRejected] = useState('')
  const [picking, setPicking] = useState(false)

  const picker = useRef(null)

  const remember = (record) => setRecords((previous) => ({ ...previous, [record.id]: record }))

  // Ids the form arrived with carry no preview, so those are read back.
  const unknown = values.filter((id) => !records[id]).join(',')

  useEffect(() => {
    if (!unknown) return

    let active = true

    for (const id of unknown.split(',')) {
      api
        .get(`${MEDIA_URL}/${id}`)
        .then(({ data }) => {
          const record = data.media ?? data

          if (active) setRecords((previous) => ({ ...previous, [record.id]: record }))
        })
        // A missing record leaves the id on show rather than a broken picture.
        .catch(() => {})
    }

    return () => {
      active = false
    }
  }, [unknown])

  const commit = (ids) => {
    // An empty field drops out of the payload rather than sending '' or [].
    input.onChange(multiple ? (ids.length ? ids : undefined) : ids[0])
    input.onBlur()
  }

  const reject = (file) => {
    if (!matchesAccept(file, accept)) return `${file.name} is not an accepted file type (${accept}).`
    if (file.size > maxSizeMb * MB) {
      return `${file.name} is ${formatMb(file.size)}, over the ${maxSizeMb}MB limit.`
    }

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

    // Only a single field swaps in place; a list appends instead.
    const replacing = !multiple && Boolean(values[0]) && replaceable && overwrite

    setBusy('upload')

    try {
      // The shared client sends JSON; the boundary has to come from the browser.
      const { data } = await api({
        url: replacing ? `${MEDIA_URL}/${values[0]}` : MEDIA_URL,
        method: replacing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        data: body,
      })
      const record = data.media ?? data

      remember(record)
      commit(multiple ? [...values, record.id] : [record.id])
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

  const detach = (id) => {
    setRejected('')
    commit(values.filter((value) => value !== id))
  }

  const remove = async (id) => {
    if (!hardDelete) {
      detach(id)
      return
    }

    if (!window.confirm(DELETE_WARNING)) return

    setBusy(`remove:${id}`)

    try {
      await api.delete(`${MEDIA_URL}/${id}`)

      detach(id)
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || error.message)
    } finally {
      setBusy('')
    }
  }

  const select = (chosen) => {
    chosen.forEach(remember)

    const ids = chosen.map((record) => record.id)

    commit(multiple ? [...values, ...ids.filter((id) => !values.includes(id))] : ids.slice(0, 1))
    setPicking(false)
  }

  const invalid = (meta.touched && Boolean(meta.error)) || Boolean(rejected)

  const preview = (id, tall) => {
    const record = records[id]
    const removing = busy === `remove:${id}`

    return (
      <div
        className={`position-relative border rounded overflow-hidden bg-body-secondary ${
          invalid ? 'border-danger' : ''
        }`}
        style={tall ? { height } : undefined}
      >
        <div className={tall ? 'h-100' : 'ratio ratio-1x1'}>
          {record?.url && isImage(record.mimetype) ? (
            <img
              src={record.url}
              alt={record.originalName || 'Selected file'}
              className="w-100 h-100 object-fit-contain"
            />
          ) : (
            <div className="d-flex flex-column h-100 align-items-center justify-content-center gap-2 text-muted small text-break px-2">
              {record ? (
                <>
                  {createElement(fileIcon(record.mimetype), { size: 28 })}
                  <span className="text-truncate mw-100">{record.originalName}</span>
                </>
              ) : (
                !removing && id
              )}
            </div>
          )}
        </div>

        {!disabled && (
          <Button
            variant={hardDelete ? 'danger' : 'secondary'}
            size="sm"
            className="position-absolute top-0 end-0 m-2 d-inline-flex align-items-center"
            title={hardDelete ? 'Delete file' : 'Remove from this field'}
            aria-label={hardDelete ? 'Delete file' : 'Remove from this field'}
            disabled={Boolean(busy)}
            onClick={() => remove(id)}
          >
            {removing ? (
              <Spinner animation="border" size="sm" role="status">
                <span className="visually-hidden">Deleting…</span>
              </Spinner>
            ) : hardDelete ? (
              <FiTrash />
            ) : (
              <FiX />
            )}
          </Button>
        )}
      </div>
    )
  }

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

      {!values.length ? (
        <div
          className={`border rounded overflow-hidden bg-body-secondary ${
            invalid ? 'border-danger' : ''
          }`}
          style={{ height }}
        >
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
        </div>
      ) : multiple ? (
        <div className="row g-2">
          {values.map((id) => (
            <div className="col-6 col-md-4 col-lg-3" key={id}>
              {preview(id)}
            </div>
          ))}
        </div>
      ) : (
        preview(values[0], true)
      )}

      {!disabled && (
        <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
          {(multiple || !values.length) && (
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-inline-flex align-items-center gap-1"
              disabled={Boolean(busy)}
              onClick={pick}
            >
              {multiple && Boolean(values.length) ? <FiPlus /> : <FiUpload />}
              {busy === 'upload' ? 'Uploading…' : 'Upload'}
            </Button>
          )}

          {!multiple && Boolean(values.length) && replaceable && (
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={Boolean(busy)}
              onClick={replace}
            >
              {busy === 'upload' ? 'Uploading…' : 'Replace'}
            </Button>
          )}

          {allowExisting && (
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={Boolean(busy)}
              onClick={() => setPicking(true)}
            >
              Choose existing
            </Button>
          )}

          {!multiple && records[values[0]]?.originalName && (
            <span className="small text-muted text-truncate">
              {records[values[0]].originalName}
            </span>
          )}
        </div>
      )}

      {rejected && <div className="small text-danger mt-2">{rejected}</div>}

      {allowExisting && (
        <MediaPicker
          show={picking}
          multiple={multiple}
          accept={accept}
          onClose={() => setPicking(false)}
          onSave={select}
        />
      )}
    </div>
  )
}
