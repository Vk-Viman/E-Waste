function httpError(status, message, details) {
  const err = new Error(message || 'Error');
  err.status = status;
  if (details) err.details = details;
  return err;
}

module.exports = { httpError };
