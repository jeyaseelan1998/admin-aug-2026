export const required = (message) => {
  const validate = (value) => (value ? undefined : message)

  // Lets a Field mark its label without being told the field is required twice.
  validate.required = true

  return validate
}
