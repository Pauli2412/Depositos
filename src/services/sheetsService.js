const { google } = require("googleapis");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CONF_SHEET_NAME = process.env.CONF_SHEET_NAME || "ConfTelepagos";

function getAuth() {
  return new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

async function readSheet(sheetName) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:Z`,
  });
  const rows = res.data.values || [];
  if (rows.length < 2) return [];

  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) =>
    Object.fromEntries(header.map((h, i) => [h, (r[i] || "").trim()]))
  );
}

async function findUser({ cuil, nombre }) {
  const users = await readSheet("BaseUsuarios");
  return users.find(
    (u) =>
      (u.CUIL && u.CUIL === cuil) ||
      (u.Nombre && u.Nombre.toLowerCase() === nombre?.toLowerCase())
  );
}

async function getTelepagosAccounts() {
  const rows = await readSheet(CONF_SHEET_NAME);
  return rows.map((r) => ({
    cuit: r["CUIL"],
    correo: r["CORREO"],
    contraseña: r["CONTRASEÑA"],
    enlace: `https://${r["ENLACE"]}`,
    plataforma: r["PLATAFORMA"],
  }));
}

module.exports = { readSheet, findUser, getTelepagosAccounts };


