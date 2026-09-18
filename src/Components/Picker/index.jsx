import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { FiCheck } from '../Icons'

/**
 * Picks from a fixed list of options in a modal, laid out as cards rather than
 * a list so each one can show what it is. An option is
 * `{ value, label, text?, image?, icon? }`: the picture and the description are
 * both optional, and one carrying neither is just its label.
 *
 * Nothing is decided here -- the chosen options are handed back whole, so
 * closing without saving leaves the caller untouched.
 */
export default function Picker({
  title = 'Select',
  options = [],
  multiple = false,
  // The values already held, shown picked when the modal opens.
  selected = [],
  saveLabel = 'Save',
  empty = 'Nothing to choose from.',
  columnClassName = 'col-6 col-md-4',
  onClose,
  onSave,
}) {
  // Mounted only while open, so it opens on what it was handed.
  const [picked, setPicked] = useState(selected)

  const toggle = (option) => {
    setPicked((previous) => {
      const without = previous.filter((value) => value !== option.value)

      // Picking the same one again clears it; a single choice holds just the last.
      if (without.length !== previous.length) return without

      return multiple ? [...previous, option.value] : [option.value]
    })
  }

  // Handed back in the order they are offered, so a caller never has to look
  // the values back up.
  const save = () => onSave(options.filter((option) => picked.includes(option.value)))

  return (
    <Modal show onHide={onClose} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5 mb-0">
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3">
        {!options.length ? (
          <div className="text-center text-muted small py-4">{empty}</div>
        ) : (
          <div className="row g-2">
            {options.map((option) => {
              const isPicked = picked.includes(option.value)

              return (
                <div className={columnClassName} key={option.value}>
                  <button
                    type="button"
                    className={`btn w-100 h-100 p-2 border rounded text-start ${
                      isPicked ? 'border-primary border-2' : ''
                    }`}
                    aria-pressed={isPicked}
                    onClick={() => toggle(option)}
                  >
                    {/* The tick sits outside the ratio box: Bootstrap stretches
                        whatever is inside one to fill it, which would cover the
                        picture. An option with no picture keeps the same frame,
                        so a mixed list still lines up. */}
                    <div className="position-relative">
                      <div className="ratio ratio-16x9 bg-body-secondary rounded overflow-hidden">
                        {option.image ? (
                          <img
                            src={option.image}
                            alt=""
                            className="w-100 h-100 object-fit-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center text-muted fs-4">
                            {option.icon}
                          </div>
                        )}
                      </div>

                      {isPicked && (
                        <span className="position-absolute top-0 end-0 m-1 badge rounded-circle text-bg-primary d-inline-flex p-1 lh-1">
                          <FiCheck />
                        </span>
                      )}
                    </div>

                    <div className="fw-semibold small text-truncate mt-2">{option.label}</div>

                    {option.text && (
                      <div className="small text-muted text-wrap">{option.text}</div>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <span className="me-auto small text-muted">
          {picked.length ? `${picked.length} selected` : 'Nothing selected'}
        </span>

        <Button variant="outline-secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" disabled={!picked.length} onClick={save}>
          {saveLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
