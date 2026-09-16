import { createElement } from 'react'
import { Card } from 'react-bootstrap'
import List from '../../Components/List'
import { fileIcon, isImage } from '../../helpers/fileIcon'

const UNITS = ['B', 'KB', 'MB', 'GB']

const formatSize = (size) => {
  let value = Number(size) || 0
  let unit = 0

  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit += 1
  }

  return `${unit ? value.toFixed(1) : value} ${UNITS[unit]}`
}

// A live record can be flagged deleted; one already flagged can only be purged.
const actions = ['DELETE', 'RESTORE', 'TRASH']

// A flagged record stays in the grid, greyed out, until it is purged.
const DELETED_STYLE = { filter: 'grayscale(1)', opacity: 0.4 }

const renderItem = (media, { actions: itemActions }) => {
  const isDeleted = media.deleted === 1

  return (
    <div className="col-6 col-md-4 col-xl-3">
      <Card className="h-100 position-relative">
        <div className="position-absolute top-0 end-0 mt-2 z-1 text-nowrap">{itemActions}</div>

        <div
          className="ratio ratio-1x1 bg-light rounded-top overflow-hidden"
          style={isDeleted ? DELETED_STYLE : undefined}
        >
          {isImage(media.mimetype) ? (
            <img
              src={media.url}
              alt={media.originalName}
              className="w-100 h-100 object-fit-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center text-muted fs-3"
              title={media.mimetype}
            >
              {createElement(fileIcon(media.mimetype))}
            </div>
          )}
        </div>

        <Card.Body className={`p-2 ${isDeleted ? 'text-muted' : ''}`}>
          <div
            className={`small text-truncate ${isDeleted ? 'text-decoration-line-through' : ''}`}
            title={media.originalName}
          >
            {media.originalName}
          </div>

          <div className="small text-muted">{formatSize(media.size)}</div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default function Media() {
  return (
    <List
      title="Media"
      url="/media"
      renderItem={renderItem}
      actions={actions}
      empty="No media yet."
    />
  )
}
