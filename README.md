# Redirector Backend

Servicio de links con pagina de consentimiento y registro de visitas en Discord.

## Privacidad

El servicio no registra visitas al cargar el link. La pagina intermedia informa los datos que se recopilan y solo envia el registro cuando el visitante pulsa `Aceptar y continuar`.

Datos permitidos despues del consentimiento:

- IP obtenida por el backend.
- User-Agent.
- Idioma del navegador.
- Zona horaria.
- Resolucion de pantalla.
- Referrer si existe.
- Fecha y hora.
- Codigo del link y URL destino.
- Navegador, sistema operativo y tipo de dispositivo aproximados.
- ID unico de visita.

No se recopilan contrasenas, cookies, tokens, archivos, clipboard, formularios, contactos ni datos sensibles.

## Variables

Crea un `.env` local usando `.env.example` como referencia. En produccion no dependas de `.env`; usa Railway Variables.

Variables requeridas:

- `PORT`
- `BASE_URL`
- `DISCORD_TOKEN`
- `DISCORD_CHANNEL_ID`
- `NODE_ENV`
- `TRUST_PROXY`
- `DATABASE_PATH`

`DISCORD_TOKEN` debe vivir solo en variables del proveedor o en `.env` local ignorado por Git. No lo subas al repositorio.

## Desarrollo local

```bash
npm install
npm run check
npm start
```

Luego revisa:

```bash
curl http://localhost:3000/health
```

## Discord

El bot registra comandos slash al iniciar:

- `/crear`
- `/stats`
- `/delete`
- `/list`
- `/health`

Las respuestas administrativas usan mensajes privados cuando Discord lo permite.

## Railway

1. Conecta el repositorio de GitHub en Railway.
2. Crea un servicio Node.js.
3. Agrega Railway Variables con los valores reales.
4. Configura `BASE_URL` con el dominio publico de Railway, por ejemplo `https://your-service.up.railway.app`.
5. Configura `PORT` con el valor que entregue Railway o deja que Railway lo inyecte.
6. Usa `TRUST_PROXY=true` en Railway.
7. Ejecuta el deploy.
8. Revisa logs sin imprimir secretos.
9. Prueba `GET /health`.
10. Prueba `/crear` en Discord.

## SQLite en Railway

Este proyecto usa SQLite en `DATABASE_PATH`. En Railway, el filesystem puede no persistir entre redeploys si no configuras un volumen. Para datos reales, configura un Railway Volume apuntando a la ruta de la base o migra a PostgreSQL de Railway.

No subas bases reales al repositorio. `data/*` esta ignorado y solo se versiona `data/.gitkeep`.

## Seguridad

- `npm start` usa `process.env.PORT`.
- `BASE_URL` se valida como URL y se usa para construir links publicos.
- `.env` esta ignorado por Git.
- `.env.example` no contiene secretos.
- `/health` no expone tokens, IDs privados completos ni secretos.
- Los logs de Discord usan `allowedMentions: { parse: [] }`.
- La URL destino se valida y solo permite `http` y `https`.
- No se usan `javascript:`, `data:`, `file:`, `ftp:` ni otros protocolos.

Si `.env` fue commiteado antes con un token real, rota el token en Discord y considera limpiar el historial del repositorio antes de distribuirlo.
