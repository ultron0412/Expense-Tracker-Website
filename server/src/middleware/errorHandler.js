function notFoundHandler(_req, res) {
  return res.status(404).json({ message: "Route not found" });
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : statusCode === 500 ? "Internal server error" : err.message;

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({
    message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

