function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error("Request failed: " + error.message);
  res.status(error.status || 500).json({ ok: false, error: "request_failed" });
}

module.exports = { errorHandler };
