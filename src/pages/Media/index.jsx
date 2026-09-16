import { createElement } from 'react'
import { Card } from 'react-bootstrap'
import List from '../../Components/List'
import { FiArchive, FiCode, FiFile, FiFileText, FiFilm, FiMusic } from '../../Components/Icons'

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

// Matched against the mimetype in order, so `application/zip` picks the archive
// before the generic fallback. Images are drawn from their url instead.
const FILE_ICONS = [
  [/^video\//, FiFilm],
  [/^audio\//, FiMusic],
  [/^text\/(html|css|javascript)|(json|xml|javascript)$/, FiCode],
  [/^text\/|pdf|word|document|sheet|presentation/, FiFileText],
  [/zip|tar|rar|7z|gzip|compressed/, FiArchive],
]

const fileIcon = (mimetype = '') =>
  FILE_ICONS.find(([pattern]) => pattern.test(mimetype))?.[1] || FiFile

// A live record can be flagged deleted; one already flagged can only be purged.
// Media's soft delete is its own route (PATCH /media/:id/delete) and takes no
// body, unlike the preset's PATCH on the record itself.
const actions = [
  [
    'DELETE',
    {
      url: (media) => `/media/${media.id}/delete`,
      payload: undefined,
      hidden: (media) => media.deleted === 1,
    },
  ],
  ['TRASH', { hidden: (media) => media.deleted !== 1 }],
]

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
          {media.mimetype?.startsWith('image/') ? (
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
