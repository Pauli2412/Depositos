const express = require("express");
const { startPolling } = require("./jobs/pollTelepagos");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./utils/logger");
const { startRetryWorker } = require("./services/retryQueue");

const app = express();
app.use(express.json());

// Middleware de errores
app.use(errorHandler);

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  logger.info(`🚀 ms-deposito running on port ${PORT}`);
});


startRetryWorker();
// Inicia el scheduler
startPolling();
