import { createElement, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { FiCheck } from '../../../Icons'
import List from '../../../List'
import { fileIcon, isImage, matchesAccept } from '../../../../helpers/file'

const asFile = (media) => ({ type: media.mimetype || '', name: media.originalName || '' })

/**
 * Browses what has already been uploaded and hands back the chosen records.
 * Nothing is written here: the field decides what to do with the selection,
 * so closing without saving leaves the form untouched.
 */
export default function MediaPicker({ multiple, accept, selected = [], onClose, onSave }) {
  // Mounted only while open, so opening starts from what the field already
  // holds: what is attached shows as picked, and can be unpicked here.
  const [picked, setPicked] = useState(selected)

  const toggle = (media) => {
    setPicked((previous) => {
      const without = previous.filter((item) => item.id !== media.id)

      // Picking the same one again clears it; a single field holds just the last.
      if (without.length !== previous.length) return without

      return multiple ? [...previous, media] : [media]
    })
  }

  const renderItem = (media) => {
    // The CMS list hands back flagged records so they can be purged there; a
    // form should not be able to attach one.
    if (media.deleted === 1) return null

    // The field's own rule decides what is offerable, e.g. images only.
    if (!matchesAccept(asFile(media), accept)) return null

    const selected = picked.some((item) => item.id === media.id)

    return (
      <div className="col-6 col-md-4 col-lg-3">
        <button
          type="button"
          className={`btn w-100 p-1 border rounded text-start ${
            selected ? 'border-primary border-2' : ''
          }`}
          aria-pressed={selected}
          onClick={() => toggle(media)}
        >
          {/* The tick sits outside the ratio box: Bootstrap stretches whatever
              is inside one to fill it, which would cover the picture. */}
          <div className="position-relative">
            <div className="ratio ratio-1x1 bg-body-secondary rounded overflow-hidden">
              {isImage(media.mimetype) ? (
                <img
                  src={media.url}
                  alt={media.originalName}
                  className="w-100 h-100 object-fit-cover"
                  loading="lazy"
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center text-muted fs-4">
                  {createElement(fileIcon(media.mimetype))}
                </div>
              )}
            </div>

            {selected && (
              <span className="position-absolute top-0 end-0 m-1 badge rounded-circle text-bg-primary d-inline-flex p-1 lh-1">
                <FiCheck />
              </span>
            )}
          </div>

          <div className="small text-truncate mt-1" title={media.originalName}>
            {media.originalName}
          </div>
        </button>
      </div>
    )
  }

  return (
    <Modal show onHide={onClose} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5 mb-0">
          {multiple ? 'Select files' : 'Select a file'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-2">
        <List url="/media" renderItem={renderItem} itemsClassName="row g-2" empty="Nothing uploaded yet." />
      </Modal.Body>

      <Modal.Footer>
        <span className="me-auto small text-muted">
          {picked.length ? `${picked.length} selected` : 'Nothing selected'}
        </span>

        <Button variant="outline-secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" disabled={!picked.length} onClick={() => onSave(picked)}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
