const sheetsService = require("./sheetsService");
const platformService = require("./platformService");
const transactionLogger = require("./transactionLogger");
const retryQueue = require("./retryQueue");
const logger = require("../utils/logger");

async function handle(tx, plataforma) {
  logger.info({ ...tx, plataforma_hint: plataforma, message: "🔔 Procesando depósito detectado" });

  try {
    const baseUsuarios = await sheetsService.readBaseUsuarios();
    const usuario = baseUsuarios.find(u => u.CUIT === tx.CUIT || u.Telefono === tx.telefono);

    if (!usuario) {
      logger.warn(`⚠️ Usuario no encontrado: ${tx.CUIT} - ${tx.titular}`);
      await transactionLogger.logError(tx, "Usuario no encontrado en BaseUsuarios");
      retryQueue.add(tx, plataforma); // reintentar luego
      return;
    }

    // aplicar fichas en la plataforma
    await platformService.depositar(usuario, tx.monto, plataforma);

    // registrar como OK
    await transactionLogger.logOk(tx, plataforma, usuario);
    logger.info(`✅ Depósito acreditado a ${usuario.Nombre} en ${plataforma}`);

  } catch (err) {
    logger.error("❌ Error en depositProcessor", err);
    await transactionLogger.logError(tx, err.message || "Error desconocido");
  }
}

module.exports = { handle };
