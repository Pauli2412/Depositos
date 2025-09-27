const sheetsService = require("./sheetsService");
const logger = require("../utils/logger");

/**
 * Registra el resultado de un reintento en Google Sheets
 * @param {Object} tx - Transacción original
 * @param {string} plataforma - Plataforma objetivo
 * @param {string} status - "success" o "error"
 * @param {string} detalle - Mensaje o motivo
 */
async function logRetry(tx, plataforma, status, detalle) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.RETRY_SHEET_NAME || "ReintentosDepositos";

    const values = [[
      new Date().toISOString(),
      tx.id,
      tx.reference_id || "",
      tx.titular || "",
      tx.CUIT || "",
      tx.telefono || "",
      tx.monto || 0,
      plataforma,
      status,
      detalle
    ]];

    await sheetsService.appendRow(spreadsheetId, sheetName, values);

    logger.info(`📝 Retry log registrado en ${sheetName}: ${tx.id} - ${status}`);
  } catch (err) {
    logger.error("❌ Error registrando retry log", err);
  }
}

module.exports = { logRetry };
