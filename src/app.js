const express = require("express");
const depositRoutes = require("./routes/depositRoutes");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./utils/logger");

const app = express();
app.use(express.json());

// Rutas
app.use("/api/deposit", depositRoutes);

// Middleware de errores
app.use(errorHandler);

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  logger.info(`🚀 ms-deposito running on port ${PORT}`);
});
