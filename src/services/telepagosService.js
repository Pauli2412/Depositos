const axios = require("axios");
const sheetsService = require("./sheetsService");
const rulesMapper = require("./rulesMapper");
const platformService = require("./platformService");
const transactionLogger = require("./transactionLogger");
const logger = require("../utils/logger");

async function getAuthToken(account) {
  const url = `${account.enlace}/v2/auth/token`;

  const { data } = await axios.post(url, {
    username: account.correo,
    password: account.contraseña,
  });

  return data; // { access_token, expires_at }
}

async function fetchTransactions(account) {
  const tokenData = await getAuthToken(account);

  const { data } = await axios.get(`${account.enlace}/v2/account/transactions`, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  return data;
}

async function handleNotification(payload) {
  try {
    logger.info("🔔 Webhook Telepagos recibido", payload);

    const { titular, CUIT, monto } = payload;

    const user = await sheetsService.findUser({ cuil: CUIT, nombre: titular });

    if (!user) {
      logger.warn(`⚠️ Usuario no encontrado: ${CUIT} - ${titular}`);
      await transactionLogger.logFailed(payload, "Usuario no encontrado en BaseUsuarios");
      return;
    }
    if (/* es duplicado */ false) {
  const errObj = { ...payload, motivo: "Depósito duplicado" };
  await transactionLogger.logFailed(errObj);
  return;
}

    const mapping = await rulesMapper.mapUser(user);

    await platformService.depositar({
      plataforma: mapping.plataforma,
      usuarioId: mapping.usuario,
      monto,
    });

    await transactionLogger.logSuccess({ ...payload, plataforma: mapping.plataforma });
  } catch (err) {
    logger.error("❌ Error en handleNotification", err);
    await transactionLogger.logFailed(payload, err.message);
    throw err;
  }
}

module.exports = { handleNotification, fetchTransactions };
