const { escapeHtml } = require("../utils/sanitize");

function buildConsentPage(link) {
  const destination = escapeHtml(link.destinationUrl);
  const code = escapeHtml(link.code);
  const payloadCode = JSON.stringify(link.code);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Consentimiento de visita</title>
  <style>
    :root { color-scheme: dark; font-family: Arial, sans-serif; background: #111318; color: #f3f5f7; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #111318; }
    main { width: min(760px, 100%); }
    h1 { font-size: clamp(28px, 4vw, 42px); margin: 0 0 16px; letter-spacing: 0; }
    p, li { color: #c9d0d8; line-height: 1.55; font-size: 16px; }
    .panel { border: 1px solid #2a3038; border-radius: 8px; padding: 24px; background: #171a20; }
    .destination { overflow-wrap: anywhere; color: #ffffff; background: #0d0f13; border: 1px solid #2a3038; border-radius: 6px; padding: 12px; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
    button { border: 0; border-radius: 6px; padding: 12px 16px; font-size: 16px; cursor: pointer; }
    .primary { background: #2f6fed; color: white; }
    .secondary { background: #2a3038; color: white; }
    .error { color: #ffb4b4; min-height: 24px; }
  </style>
</head>
<body>
  <main>
    <h1>Servicio de links con consentimiento</h1>
    <section class="panel">
      <p>Destino del link:</p>
      <p class="destination">${destination}</p>
      <p>Si aceptas, se registrara una visita consentida para estadisticas basicas y seguridad operativa del servicio.</p>
      <p>Datos recopilados despues de aceptar:</p>
      <ul>
        <li>IP obtenida por el servidor, fecha y hora, codigo del link y URL destino.</li>
        <li>User-Agent, idioma del navegador, zona horaria, resolucion de pantalla y referrer si existe.</li>
        <li>Navegador, sistema operativo y tipo de dispositivo aproximados.</li>
      </ul>
      <p>No se recopilan contrasenas, cookies, tokens, archivos, clipboard, formularios ni datos sensibles.</p>
      <p class="error" id="error"></p>
      <div class="actions">
        <button class="primary" id="accept" type="button">Aceptar y continuar</button>
        <button class="secondary" id="exit" type="button">Salir</button>
      </div>
    </section>
  </main>
  <script>
    const code = ${payloadCode};
    const errorNode = document.getElementById("error");
    document.getElementById("exit").addEventListener("click", function() {
      window.location.href = "about:blank";
    });
    document.getElementById("accept").addEventListener("click", async function(event) {
      event.currentTarget.disabled = true;
      errorNode.textContent = "";
      try {
        const response = await fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            consent: true,
            language: navigator.language || "",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
            screen: String(window.screen.width) + "x" + String(window.screen.height),
            referrer: document.referrer || ""
          })
        });
        const data = await response.json();
        if (!response.ok || !data.ok || !data.redirectTo) {
          throw new Error("No se pudo registrar la visita.");
        }
        window.location.assign(data.redirectTo);
      } catch (error) {
        errorNode.textContent = "No se pudo continuar. Intentalo nuevamente.";
        event.currentTarget.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}

function buildMissingLinkPage() {
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Link no disponible</title></head>
<body><main><h1>Link no disponible</h1><p>El link no existe o fue desactivado.</p></main></body>
</html>`;
}

module.exports = { buildConsentPage, buildMissingLinkPage };
