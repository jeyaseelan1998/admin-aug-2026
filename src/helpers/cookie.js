// A small document.cookie wrapper. Names and values are URI-encoded, and every
// cookie lives at path=/ so setting and removing always address the same one.

const DEFAULT_SAME_SITE = 'Strict'

/**
 * `expires` is a Date or a millisecond timestamp; without it the cookie lasts
 * until the browser closes. Secure is on whenever the page is served over
 * https, so the value never travels over plain http.
 */
export const setCookie = (name, value, { expires, sameSite = DEFAULT_SAME_SITE } = {}) => {
  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    'path=/',
    `SameSite=${sameSite}`,
  ]

  if (expires) parts.push(`expires=${new Date(expires).toUTCString()}`)
  if (window.location.protocol === 'https:') parts.push('Secure')

  document.cookie = parts.join('; ')
}

export const getCookie = (name) => {
  const prefix = `${encodeURIComponent(name)}=`
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix))

  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null
}

export const removeCookie = (name) => {
  document.cookie = `${encodeURIComponent(name)}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=${DEFAULT_SAME_SITE}`
}
