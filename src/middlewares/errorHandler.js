const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  logger.error("❌ Error capturado", err);
  res.status(500).json({ ok: false, error: err.message });
}

module.exports = errorHandler;
