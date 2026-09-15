// Supports dotted paths into nested objects and arrays, e.g. 'address.0.city'.
export const resolvePath = (row, path) =>
  String(path)
    .split('.')
    .reduce((value, segment) => (value == null ? undefined : value[segment]), row)
