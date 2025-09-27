const logger = require("../utils/logger");
const depositProcessor = require("./depositProcessor");
const retryLogger = require("./retryLogger");
const loginClient = require("./loginClient");

let queue = [];

function add(tx, plataforma) {
  const retryAt = Date.now() + 30 * 60 * 1000;
  queue.push({ tx, plataforma, retryAt, attempts: 1 });
  logger.warn(`⏳ Transacción ${tx.id} en cola de reintento para ${plataforma}`);
}

async function processQueue() {
  const now = Date.now();
  const ready = queue.filter(item => item.retryAt <= now);
  queue = queue.filter(item => item.retryAt > now);

  for (const item of ready) {
    const { tx, plataforma, attempts } = item;

    try {
      logger.info(`🔁 Reintentando transacción ${tx.id} (${attempts} intento)`);

      // Procesar depósito
      const usuario = await depositProcessor.handle(tx, plataforma);

      // Si el depósito se valida, llamamos a ms-login
      if (usuario) {
        await loginClient.depositar(plataforma, usuario, tx.monto);
        await retryLogger.logRetry(tx, plataforma, "success", "Depósito completado en plataforma");
      } else {
        throw new Error("Usuario no encontrado");
      }

    } catch (err) {
      logger.error(`❌ Error en reintento ${tx.id}`, err.message);

      await retryLogger.logRetry(tx, plataforma, "error", err.message);

      if (attempts < 3) {
        const nextRetry = now + Math.pow(2, attempts - 1) * 30 * 60 * 1000;
        queue.push({ tx, plataforma, retryAt: nextRetry, attempts: attempts + 1 });
        logger.warn(`⏳ Reprogramado transacción ${tx.id} para ${new Date(nextRetry).toISOString()}`);
      } else {
        logger.error(`💀 Transacción ${tx.id} falló definitivamente tras 3 intentos`);
      }
    }
  }
}

function startRetryWorker() {
  setInterval(processQueue, 60 * 1000);
  logger.info("🔄 RetryQueue iniciado (intervalo 1 min, reintentos cada 30min)");
}

module.exports = { add, startRetryWorker };
