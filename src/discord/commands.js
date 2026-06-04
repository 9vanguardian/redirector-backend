const { SlashCommandBuilder } = require("discord.js");

function buildCommands() {
  return [
    new SlashCommandBuilder()
      .setName("crear")
      .setDescription("Crea un link con registro consentido")
      .addStringOption(function(option) {
        return option.setName("url").setDescription("URL destino http o https").setRequired(true);
      }),
    new SlashCommandBuilder()
      .setName("stats")
      .setDescription("Muestra estadisticas de un link")
      .addStringOption(function(option) {
        return option.setName("code").setDescription("Codigo del link").setRequired(true);
      }),
    new SlashCommandBuilder()
      .setName("delete")
      .setDescription("Desactiva un link")
      .addStringOption(function(option) {
        return option.setName("code").setDescription("Codigo del link").setRequired(true);
      }),
    new SlashCommandBuilder()
      .setName("list")
      .setDescription("Lista tus links recientes"),
    new SlashCommandBuilder()
      .setName("health")
      .setDescription("Revisa el estado del servicio")
  ].map(function(command) {
    return command.toJSON();
  });
}

module.exports = { buildCommands };
