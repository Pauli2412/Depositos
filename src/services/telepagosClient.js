const axios = require("axios");
const logger = require("../utils/logger");

class TelepagosClient {
  constructor(cuenta) {
    this.cuenta = cuenta; // { cuit, correo, contraseña, enlace, plataforma }
    this.token = null;
    this.apiBase = `https://api.telepagos.com.ar/v2`;
  }

  async init() {
    const url = `${this.apiBase}/auth/token`;
    try {
      const { data } = await axios.post(url, {
        username: this.cuenta.correo,
        password: this.cuenta.contraseña,
      });
      this.token = data.access_token;
      logger.info(`🔑 Token obtenido para ${this.cuenta.plataforma}`);
    } catch (err) {
      logger.error(`❌ Error autenticando Telepagos ${this.cuenta.plataforma}`, err.response?.data || err.message);
      throw err;
    }
  }

  async getTransactions(from, to) {
    if (!this.token) throw new Error("Token no disponible");
    const url = `${this.apiBase}/account/transactions`;
    const params = {
      date_from: from.toISOString().split("T")[0],
      date_to: to.toISOString().split("T")[0],
    };

    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${this.token}` },
      params,
    });

    logger.info(`📑 ${data.length} transacciones obtenidas para ${this.cuenta.plataforma}`);
    return data || [];
  }
}

module.exports = TelepagosClient;
