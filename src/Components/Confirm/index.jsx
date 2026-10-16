import { useCallback, useRef, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { ConfirmContext } from './context'

const DEFAULTS = {
  title: 'Are you sure?',
  confirmLabel: 'Yes',
  cancelLabel: 'No',
  variant: 'danger',
}

// One dialog for the whole app, opened through useConfirm() in place of window.confirm.
export default function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  // The pending promise's resolver, settled exactly once by answer().
  const resolver = useRef(null)

  // Only hides the dialog: its text stays until the fade-out has finished
  // (see onExited), so it never flashes empty while closing.
  const answer = useCallback((value) => {
    resolver.current?.(value)
    resolver.current = null
    setDialog((current) => current && { ...current, show: false })
  }, [])

  const confirm = useCallback((message, options = {}) => {
    // A second request before the first is answered counts as "No" for the first.
    resolver.current?.(false)

    return new Promise((resolve) => {
      resolver.current = resolve
      setDialog({ ...DEFAULTS, ...options, message, show: true })
    })
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <Modal
        show={Boolean(dialog?.show)}
        onHide={() => answer(false)}
        onExited={() => setDialog((current) => (current?.show ? current : null))}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5">
            {dialog?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{dialog?.message}</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => answer(false)}>
            {dialog?.cancelLabel}
          </Button>
          <Button variant={dialog?.variant} onClick={() => answer(true)} autoFocus>
            {dialog?.confirmLabel}
          </Button>
        </Modal.Footer>
      </Modal>
    </ConfirmContext.Provider>
  )
}
