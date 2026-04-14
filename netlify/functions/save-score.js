// netlify/functions/save-score.js
// Esta función corre en el servidor de Netlify, no en el browser.
// Recibe los datos del quiz y los reenvía a Google Apps Script sin problemas de CORS.

exports.handler = async (event) => {
  // Permitir CORS para que el HTML pueda llamar a esta función
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Manejar preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { nombre, correctos, total } = JSON.parse(event.body || "{}");

    // La URL del GAS se guarda como variable de entorno en Netlify (no en el código)
    const GAS_URL = process.env.GAS_URL;

    if (!GAS_URL) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "GAS_URL no configurada" }) };
    }

    const params = new URLSearchParams({ nombre, correctos, total: String(total) });
    const url = `${GAS_URL}?${params.toString()}`;

    // Llamada servidor→GAS, sin restricciones de CORS
    const response = await fetch(url, { redirect: "follow" });
    const text = await response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, gas_response: text })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
