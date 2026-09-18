import { Button, Card } from 'react-bootstrap'
import { useField } from 'react-final-form'
import { FiArrowDown, FiArrowUp, FiPlus, FiX } from '../../Icons'

const swap = (items, from, to) => {
  const next = [...items]
  const moved = next[from]

  next[from] = next[to]
  next[to] = moved

  return next
}

/**
 * A repeated field: one name holds an array of rows, and each row is handed its
 * own name so what goes inside it stays ordinary Fields -- `widgets[0].title`.
 * The array is rewritten whole on every change, which is the shape an API that
 * replaces a repeated field wholesale expects.
 *
 * Rows arrive either from the built-in button, stamped from `blank`, or from
 * whatever `renderAdd` puts in its place -- a picker, say -- which is handed
 * `push` to add with.
 */
export default function Repeater({
  name,
  label,
  help,
  renderItem,
  // The heading on a row; falls back to its position in the list.
  rowLabel,
  // The row a plain Add button starts from, as a value or a factory.
  blank,
  addLabel = 'Add',
  renderAdd,
  reorder = true,
  disabled = false,
  empty = 'Nothing added yet.',
}) {
  const { input } = useField(name, { subscription: { value: true } })

  const items = Array.isArray(input.value) ? input.value : []

  // An emptied list is sent as [], not dropped: clearing every row has to reach
  // the API as a clearing rather than as "leave whatever is already there".
  const commit = (next) => input.onChange(next)

  const push = (item) => commit([...items, item])
  const removeAt = (index) => commit(items.filter((item, at) => at !== index))
  const move = (index, step) => commit(swap(items, index, index + step))

  return (
    <div className="mb-3">
      {label && <div className="form-label mb-1">{label}</div>}
      {help && <div className="small text-muted mb-2">{help}</div>}

      {!items.length && (
        <div className="border rounded text-center text-muted small py-4 mb-2">{empty}</div>
      )}

      {/* Keyed by position: every input inside is driven by form state, so a
          reordered row redraws from the value that moved into its place. */}
      {items.map((item, index) => (
        <Card className="mb-2" key={index}>
          <Card.Header className="d-flex align-items-center gap-2 py-2">
            <span className="fw-semibold small">
              {rowLabel ? rowLabel(item, index) : `${label || 'Item'} ${index + 1}`}
            </span>

            {!disabled && (
              <span className="ms-auto d-inline-flex gap-1">
                {reorder && (
                  <>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      title="Move up"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <FiArrowUp />
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      title="Move down"
                      aria-label="Move down"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <FiArrowDown />
                    </Button>
                  </>
                )}

                <Button
                  variant="outline-danger"
                  size="sm"
                  title="Remove"
                  aria-label="Remove"
                  onClick={() => removeAt(index)}
                >
                  <FiX />
                </Button>
              </span>
            )}
          </Card.Header>

          <Card.Body>
            {renderItem({ name: `${name}[${index}]`, index, value: item, disabled })}
          </Card.Body>
        </Card>
      ))}

      {!disabled &&
        (renderAdd ? (
          renderAdd({ push })
        ) : (
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-inline-flex align-items-center gap-1"
            onClick={() => push(typeof blank === 'function' ? blank() : { ...blank })}
          >
            <FiPlus />
            {addLabel}
          </Button>
        ))}
    </div>
  )
}
