export const required = (message) => {
  const validate = (value) => (value ? undefined : message)

  // Lets a Field mark its label without being told the field is required twice.
  validate.required = true

  return validate
}

// Partial input counts while typing: '1.' and '.5' are on their way to a number.
const NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)$/

export const number =
  (message = 'Must be a number') =>
  (value) =>
    value === undefined || value === null || value === '' || NUMERIC.test(String(value))
      ? undefined
      : message

// Runs validators in order and reports the first complaint.
export const compose =
  (...validators) =>
  (value, values, meta) => {
    for (const validate of validators) {
      const error = validate?.(value, values, meta)

      if (error) return error
    }

    return undefined
  }
