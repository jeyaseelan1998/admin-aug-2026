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
