import { FiArchive, FiCode, FiFile, FiFileText, FiFilm, FiImage, FiMusic } from '../Components/Icons'

// Matched against the mimetype in order, so `application/zip` picks the archive
// before the generic fallback.
const FILE_ICONS = [
  [/^image\//, FiImage],
  [/^video\//, FiFilm],
  [/^audio\//, FiMusic],
  [/^text\/(html|css|javascript)|(json|xml|javascript)$/, FiCode],
  [/^text\/|pdf|word|document|sheet|presentation/, FiFileText],
  [/zip|tar|rar|7z|gzip|compressed/, FiArchive],
]

/** The icon standing in for a file that cannot be shown as a picture. */
export const fileIcon = (mimetype = '') =>
  FILE_ICONS.find(([pattern]) => pattern.test(mimetype))?.[1] || FiFile

export const isImage = (mimetype = '') => mimetype.startsWith('image/')

/**
 * Reads an `accept` attribute the way a file input does -- 'image/*',
 * 'image/png,.webp' -- against anything carrying a mimetype and a name, so a
 * picked file and a stored media record can be checked the same way.
 */
export const matchesAccept = ({ type = '', name = '' }, accept) =>
  !accept ||
  accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) return name.toLowerCase().endsWith(rule)
      if (rule.endsWith('/*')) return type.toLowerCase().startsWith(rule.slice(0, -1))

      return type.toLowerCase() === rule
    })
