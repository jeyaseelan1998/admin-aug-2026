import { getCookie, removeCookie, setCookie } from './cookie'

// Not `cms_token`: the API used to set an httpOnly cookie by that name, and a
// page script cannot overwrite an httpOnly cookie, so reusing it would fail
// silently wherever the old one is still stored.
const TOKEN_COOKIE = 'admin_token'

export const getToken = () => getCookie(TOKEN_COOKIE)

/** Stores the token from a sign-in response until the moment it expires. */
export const saveSession = ({ token, expiresAt }) =>
  setCookie(TOKEN_COOKIE, token, { expires: expiresAt * 1000 })

export const clearSession = () => removeCookie(TOKEN_COOKIE)
