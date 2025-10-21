module.exports = function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Server Error';
  const details = err.details;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('Error:', err);
  }
  res.status(status).json({ error: { status, message, details } });
};
