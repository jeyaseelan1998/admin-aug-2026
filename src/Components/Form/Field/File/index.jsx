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

const apiError = (error) =>
  error.response?.data?.error || error.response?.data?.message || error.message

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
  const [dragging, setDragging] = useState(false)

  const picker = useRef(null)

  // dragenter/dragleave fire again for every child the pointer crosses, so the
  // highlight follows a depth count rather than the last event seen.
  const depth = useRef(0)

  // Merged, so a record handed back by the picker as a bare id never wipes a
  // preview that has already been read.
  const remember = (record) =>
    setRecords((previous) => ({ ...previous, [record.id]: { ...previous[record.id], ...record } }))

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

  const send = async (file, replacing) => {
    const body = new FormData()

    body.append('file', file)

    // The shared client sends JSON; the boundary has to come from the browser.
    const { data } = await api({
      url: replacing ? `${MEDIA_URL}/${values[0]}` : MEDIA_URL,
      method: replacing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: body,
    })

    return data.media ?? data
  }

  const upload = async (chosen) => {
    // A list takes everything given; a single field only ever the first.
    const files = multiple ? chosen : chosen.slice(0, 1)

    if (!files.length) return

    const problems = []
    const accepted = []

    // One bad file out of several is reported and skipped, not a reason to
    // drop the rest of the batch.
    for (const file of files) {
      const problem = reject(file)

      if (problem) problems.push(problem)
      else accepted.push(file)
    }

    setRejected(problems.join(' '))

    if (!accepted.length) return

    // Only a single field swaps in place; a list appends instead.
    const replacing = !multiple && Boolean(values[0]) && replaceable && overwrite
    const uploaded = []

    // One at a time, so the order picked is the order stored and the API is
    // not handed a burst of large bodies at once.
    for (const [index, file] of accepted.entries()) {
      setBusy(accepted.length > 1 ? `upload:${index + 1}/${accepted.length}` : 'upload')

      try {
        uploaded.push(await send(file, replacing))
      } catch (error) {
        toast.error(apiError(error))
      }
    }

    // Whatever made it through is kept, even if a later one failed.
    if (uploaded.length) {
      uploaded.forEach(remember)

      const ids = uploaded.map((record) => record.id)

      commit(multiple ? [...values, ...ids] : ids.slice(0, 1))
    }

    setBusy('')
  }

  const onPicked = (event) => {
    const chosen = Array.from(event.target.files || [])

    // Clearing lets the same file be picked again after a removal.
    event.target.value = ''

    upload(chosen)
  }

  const pick = () => picker.current?.click()

  const replace = () => {
    if (!overwrite || window.confirm(REPLACE_WARNING)) pick()
  }

  // A single field that already holds a file only takes a drop if it offers a
  // swap at all -- the same rule that decides whether Replace is there.
  const swappable = multiple || !values[0] || replaceable

  // Dragged text or a link is not something to upload, and a field that is
  // disabled or already busy takes nothing at all.
  const droppable = (event) =>
    !disabled &&
    !busy &&
    swappable &&
    Array.from(event.dataTransfer?.types || []).includes('Files')

  const onDragEnter = (event) => {
    if (!droppable(event)) return

    depth.current += 1
    setDragging(true)
  }

  // Without this the browser opens the file instead of handing it over.
  const onDragOver = (event) => {
    if (droppable(event)) event.preventDefault()
  }

  const onDragLeave = () => {
    depth.current = Math.max(depth.current - 1, 0)

    if (!depth.current) setDragging(false)
  }

  const onDrop = (event) => {
    if (!droppable(event)) return

    event.preventDefault()
    depth.current = 0
    setDragging(false)

    const dropped = Array.from(event.dataTransfer.files || [])

    if (!dropped.length) return

    // Dropping onto a single field that is already filled is a replace, so it
    // asks the same question the Replace button does.
    if (!multiple && values[0] && overwrite && !window.confirm(REPLACE_WARNING)) return

    upload(dropped)
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
      toast.error(apiError(error))
    } finally {
      setBusy('')
    }
  }

  // The picker opens on the current selection, so what comes back is the whole
  // of it: anything unpicked there is dropped here.
  const select = (chosen) => {
    chosen.forEach(remember)

    const ids = chosen.map((record) => record.id)

    commit(multiple ? ids : ids.slice(0, 1))
    setPicking(false)
  }

  const uploading = busy.startsWith('upload')
  const progress = uploading ? busy.split(':')[1] : ''

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
    <div
      className={invalid ? 'is-invalid' : ''}
      // An outline rather than a border: it sits outside the box, so the field
      // does not jump as the highlight comes and goes.
      style={
        dragging
          ? { outline: '2px dashed var(--bs-primary)', outlineOffset: '4px', borderRadius: '.375rem' }
          : undefined
      }
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={picker}
        type="file"
        accept={accept}
        multiple={multiple}
        className="d-none"
        disabled={disabled || Boolean(busy)}
        onChange={onPicked}
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
            {uploading ? (
              <>
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Uploading…</span>
                </Spinner>
                {progress && <span className="small">Uploading {progress}…</span>}
              </>
            ) : (
              <>
                <FiUpload size={24} />
                <span>{dragging ? 'Drop to upload' : placeholder}</span>
                <span className="small text-muted">
                  {accept || 'Any file'} · up to {maxSizeMb}MB
                </span>
                <span className="small text-muted">
                  Drag {multiple ? 'files' : 'a file'} here, or click to browse
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
              {uploading ? `Uploading${progress ? ` ${progress}` : ''}…` : 'Upload'}
            </Button>
          )}

          {!multiple && Boolean(values.length) && replaceable && (
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={Boolean(busy)}
              onClick={replace}
            >
              {uploading ? 'Uploading…' : 'Replace'}
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

      {allowExisting && picking && (
        <MediaPicker
          multiple={multiple}
          accept={accept}
          selected={values.map((id) => records[id] ?? { id })}
          onClose={() => setPicking(false)}
          onSave={select}
        />
      )}
    </div>
  )
}
