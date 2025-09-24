const axios = require("axios");
const logger = require("../utils/logger");

const MS_LOGIN_URL = process.env.MS_LOGIN_URL || "http://localhost:4002";

async function depositar({ plataforma, usuarioId, monto }) {
  try {
    const res = await axios.post(`${MS_LOGIN_URL}/deposit`, {
      plataforma,
      usuario: usuarioId,
      monto,
    });

    logger.info(`✅ Depósito exitoso en ${plataforma} para usuario ${usuarioId}`);
    return res.data;
  } catch (err) {
    logger.error(`❌ Error en depósito ${plataforma}`, err);
    throw err;
  }
}

module.exports = { depositar };
