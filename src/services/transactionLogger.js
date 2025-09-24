const { google } = require("googleapis");

function getSheetsClient() {
  const jwt = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  return google.sheets({ version: "v4", auth: jwt });
}

// ✅ Depositos correctos
async function logSuccess(data) {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const range = "DepositosOK!A:H";

  const values = [[
    new Date().toISOString(),
    data.id || "",
    data.reference_id || "",
    data.titular || "",
    data.CUIT || "",
    data.telefono || "",
    data.monto || "",
    data.plataforma_hint || "",
    data.description || "",
    data.status || ""
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values }
  });

  console.log("✅ Depósito registrado en DepositosOK:", data.reference_id || data.id);
}

// ❌ Errores y rechazos
async function logFailed(evento, motivoError) {
  try {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = "ErroresDepositos!A:Z";

    const values = [[
      new Date().toISOString(),      // Fecha
      evento.id || "",               // ID
      evento.reference_id || "",     // ReferenceID
      evento.titular || "",          // Titular
      evento.CUIT || "",             // CUIT
      evento.telefono || "",         // Telefono
      evento.monto || "",            // Monto
      evento.plataforma_hint || "",  // PlataformaHint
      motivoError || "Motivo no especificado" // MotivoError
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource: { values }
    });

    console.log(`⚠️ Error registrado en ErroresDepositos: ${motivoError}`);
  } catch (err) {
    console.error("❌ Error escribiendo en ErroresDepositos:", err);
  }
}


module.exports = { logSuccess, logFailed };
