// The API reports failures as { error }, with { message } as a fallback for
// other services; without either, axios's own text ("status code 400") is used.
export const getErrorMessage = (error) =>
  error?.response?.data?.error || error?.response?.data?.message || error?.message
