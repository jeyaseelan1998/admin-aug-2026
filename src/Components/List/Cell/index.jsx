import { useEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { FiCheck, FiClipboard } from '../../Icons'
import { resolvePath } from '../../../helpers/resolvePath'

// `type` picks the markup a value is drawn with; add an entry to support a new one.
const CELL_TYPES = {
  color: (value) => (
    <span
      className="d-inline-block border rounded"
      style={{ width: '64px', height: '16px', background: value }}
      title={value}
    />
  ),
}

// `copy: true` copies the raw cell value; a function returns the text to copy instead.
const resolveCopyText = (row, column, index) => {
  if (!column.copy) return ''

  const text = column.copy === true ? resolvePath(row, column.key) : column.copy(row, index)

  return text == null ? '' : String(text)
}

const COPIED_FOR = 2000

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text)

      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), COPIED_FOR)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Button
      variant="link"
      size="sm"
      className={`p-0 lh-1 ${copied ? 'text-success' : 'text-muted'}`}
      title={copied ? 'Copied' : 'Copy'}
      aria-label={`Copy ${text}`}
      onClick={handleClick}
    >
      {copied ? <FiCheck /> : <FiClipboard />}
    </Button>
  )
}

// `render` wins over `type`, so a one-off column never needs a registered type.
export default function Cell({ row, column, index }) {
  const value = resolvePath(row, column.key)
  const type = CELL_TYPES[column.type]

  const content = column.render
    ? column.render(row, index)
    : type
      ? type(value, row, index)
      : value

  const copyText = resolveCopyText(row, column, index)

  if (!copyText) return content ?? null

  return (
    <span className="d-inline-flex align-items-center gap-2">
      {content}
      <CopyButton text={copyText} />
    </span>
  )
}
