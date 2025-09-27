const axios = require("axios");
const logger = require("../utils/logger");

const BASE_URL = process.env.MS_LOGIN_URL; // 👈 obligamos a usar env

require('dotenv').config();

if (!BASE_URL) {
  throw new Error("MS_LOGIN_URL no configurado en .env");
}

/**
 * Envía fichas a la plataforma usando ms-login
 * @param {string} plataforma - "Playbet" | "Ganamos" | "Aguante" | "Buffalo"
 * @param {string} usuario    - Usuario en la plataforma
 * @param {number} monto      - Monto/fichas
 */
async function depositar(plataforma, usuario, monto) {
  try {
    const url = `${BASE_URL.replace(/\/+$/, "")}/api/login/depositar`;
    const payload = { plataforma, usuario, monto };

    const { data } = await axios.post(url, payload, {
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
    });

    logger.info(`✅ Depósito enviado a ${plataforma} (${usuario} - ${monto})`);
    return data;
  } catch (err) {
    const msg = err.response?.data?.error || err.message;
    logger.error(`❌ Error al depositar en ${plataforma}: ${msg}`);
    throw new Error(msg);
  }
}

module.exports = { depositar };
