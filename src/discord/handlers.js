const { REST, Routes, PermissionFlagsBits } = require("discord.js");
const { buildCommands } = require("./commands");
const { buildLinkCreatedEmbed, buildStatsEmbed } = require("./embeds");
const { createLinkService } = require("../services/link.service");
const { validateCode, buildPublicLink } = require("../utils/urls");
const { sanitizeForDiscord } = require("../utils/sanitize");

async function registerCommands(discord, env) {
  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(discord.client.user.id), { body: buildCommands() });
  console.log("Discord slash commands registered");
}

function attachInteractionHandlers(discord, database, env) {
  const links = createLinkService(database);

  discord.client.on("interactionCreate", async function(interaction) {
    if (!interaction.isChatInputCommand()) return;

    try {
      if (interaction.commandName === "crear") {
        return handleCreate(interaction, links, env);
      }

      if (interaction.commandName === "stats") {
        return handleStats(interaction, database);
      }

      if (interaction.commandName === "delete") {
        return handleDelete(interaction, links);
      }

      if (interaction.commandName === "list") {
        return handleList(interaction, links, env);
      }

      if (interaction.commandName === "health") {
        return handleHealth(interaction, database, discord, env);
      }
    } catch (error) {
      console.error("Interaction failed: " + error.message);
      await safeReply(interaction, { content: "The command could not be completed.", ephemeral: true });
    }
  });
}

async function handleCreate(interaction, links, env) {
  const destinationUrl = interaction.options.getString("url", true);
  const link = links.createLink({
    destinationUrl,
    createdBy: interaction.user.id,
    createdInChannel: interaction.channelId || "unknown"
  });

  await safeReply(interaction, {
    embeds: [buildLinkCreatedEmbed(link, env)],
    content: "Generated link: " + buildPublicLink(env.BASE_URL, link.code),
    ephemeral: true,
    allowedMentions: { parse: [] }
  });
}

async function handleStats(interaction, database) {
  const code = validateCode(interaction.options.getString("code", true));
  if (!code) {
    return safeReply(interaction, { content: "Invalid code.", ephemeral: true });
  }

  const link = database.links.findByCode(code);
  if (!link) {
    return safeReply(interaction, { content: "Link not found.", ephemeral: true });
  }

  const stats = database.visits.statsForLink(code);
  await safeReply(interaction, {
    embeds: [buildStatsEmbed(link, stats)],
    ephemeral: true,
    allowedMentions: { parse: [] }
  });
}

async function handleDelete(interaction, links) {
  const code = validateCode(interaction.options.getString("code", true));
  if (!code) {
    return safeReply(interaction, { content: "Invalid code.", ephemeral: true });
  }

  const link = links.getLink(code);
  if (!link) {
    return safeReply(interaction, { content: "Link not found.", ephemeral: true });
  }

  const canManage = interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild);
  if (link.createdBy !== interaction.user.id && !canManage) {
    return safeReply(interaction, { content: "You do not have permission to delete this link.", ephemeral: true });
  }

  links.deleteLink(code);
  await safeReply(interaction, { content: "Link deactivated.", ephemeral: true });
}

async function handleList(interaction, links, env) {
  const rows = links.listLinks(interaction.user.id, 10);

  if (rows.length === 0) {
    return safeReply(interaction, { content: "You have no links.", ephemeral: true });
  }

  const content = rows.map(function(link) {
    const state = link.active ? "active" : "inactive";
    return [
      "Code: " + sanitizeForDiscord(link.code, 40),
      "Visits: " + link.totalVisits,
      "State: " + state,
      "URL: " + sanitizeForDiscord(buildPublicLink(env.BASE_URL, link.code), 200)
    ].join(" | ");
  }).join("\n");

  await safeReply(interaction, { content, ephemeral: true, allowedMentions: { parse: [] } });
}

async function handleHealth(interaction, database, discord, env) {
  let storage = "ok";
  try {
    database.health();
  } catch (error) {
    storage = "error";
  }

  await safeReply(interaction, {
    content: [
      "service: running",
      "discord: " + discord.status(),
      "storage: " + storage,
      "env: " + env.NODE_ENV
    ].join("\n"),
    ephemeral: true
  });
}

async function safeReply(interaction, payload) {
  const finalPayload = Object.assign({ allowedMentions: { parse: [] } }, payload);

  if (interaction.replied || interaction.deferred) {
    return interaction.followUp(finalPayload);
  }

  return interaction.reply(finalPayload);
}

module.exports = { registerCommands, attachInteractionHandlers };
