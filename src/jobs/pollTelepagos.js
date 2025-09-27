const cron = require("node-cron");
const telepagosClient = require("../services/telepagosClient");
const depositProcessor = require("../services/depositProcessor");
const sheetsService = require("../services/sheetsService");
const logger = require("../utils/logger");

let lastCheck = new Date(Date.now() - 5 * 60 * 1000); // últimos 5 minutos

async function poll() {
  try {
    logger.info("🔄 Iniciando polling Telepagos...");

    // leer credenciales de ConfTelepagos
    const cuentas = await sheetsService.readConfPlataformas();
    const now = new Date();

    for (const cuenta of cuentas) {
      try {
        logger.info(`📡 Revisando cuenta Telepagos: ${cuenta.plataforma}`);

        const client = new telepagosClient(cuenta);
        await client.init();

        // traer movimientos desde la última revisión
        const transacciones = await client.getTransactions(lastCheck, now);

        for (const tx of transacciones) {
          await depositProcessor.handle(tx, cuenta.plataforma);
        }
      } catch (err) {
        logger.error(`❌ Error en cuenta ${cuenta.plataforma}`, err);
      }
    }

    lastCheck = now;
    logger.info("✅ Polling completado");

  } catch (err) {
    logger.error("💥 Error general en pollTelepagos", err);
  }
}

// Ejecutar cada minuto
function startPolling() {
  cron.schedule("* * * * *", poll);
  logger.info("⏱️ Polling Telepagos programado cada minuto");
}

module.exports = { startPolling };
