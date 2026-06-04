const { EmbedBuilder } = require("discord.js");
const { sanitizeForDiscord, truncate } = require("../utils/sanitize");
const { buildPublicLink } = require("../utils/urls");

function baseEmbed(title) {
  return new EmbedBuilder()
    .setColor(0x2f6fed)
    .setTitle(title)
    .setTimestamp(new Date());
}

function buildLinkCreatedEmbed(link, env) {
  return baseEmbed("Link created")
    .addFields(
      { name: "Code", value: sanitizeForDiscord(link.code, 100), inline: true },
      { name: "Public link", value: sanitizeForDiscord(buildPublicLink(env.BASE_URL, link.code), 300), inline: false },
      { name: "Destination", value: sanitizeForDiscord(link.destinationUrl, 500), inline: false },
      { name: "Privacy", value: "Visits are logged only after the visitor accepts the consent page.", inline: false }
    );
}

function buildVisitEmbed(link, visit) {
  return baseEmbed("Consented visit")
    .addFields(
      { name: "Code", value: sanitizeForDiscord(link.code, 100), inline: true },
      { name: "Destination", value: sanitizeForDiscord(link.destinationUrl, 500), inline: false },
      { name: "IP", value: sanitizeForDiscord(visit.ip, 100), inline: true },
      { name: "Country", value: sanitizeForDiscord(visit.country, 100), inline: true },
      { name: "City", value: sanitizeForDiscord(visit.city, 100), inline: true },
      { name: "ISP", value: sanitizeForDiscord(visit.isp, 160), inline: false },
      { name: "Browser", value: sanitizeForDiscord(visit.browser, 120), inline: true },
      { name: "Device", value: sanitizeForDiscord(visit.deviceType, 80), inline: true },
      { name: "OS", value: sanitizeForDiscord(visit.os, 120), inline: true },
      { name: "Language", value: sanitizeForDiscord(visit.language, 80), inline: true },
      { name: "Timezone", value: sanitizeForDiscord(visit.timezone, 120), inline: true },
      { name: "Screen", value: sanitizeForDiscord(visit.screen, 40), inline: true },
      { name: "Referrer", value: sanitizeForDiscord(visit.referrer, 300), inline: false },
      { name: "Consent", value: "Accepted", inline: true },
      { name: "Visit ID", value: sanitizeForDiscord(visit.id, 120), inline: false }
    );
}

function buildStatsEmbed(link, stats) {
  return baseEmbed("Link stats")
    .addFields(
      { name: "Code", value: sanitizeForDiscord(link.code, 100), inline: true },
      { name: "Destination", value: sanitizeForDiscord(link.destinationUrl, 500), inline: false },
      { name: "Creator", value: sanitizeForDiscord(link.createdBy, 100), inline: true },
      { name: "Created at", value: sanitizeForDiscord(link.createdAt, 100), inline: true },
      { name: "Total visits", value: String(link.totalVisits), inline: true },
      { name: "Last visit", value: sanitizeForDiscord(link.lastVisitAt, 100), inline: true },
      { name: "Top countries", value: formatRanking(stats.countries), inline: false },
      { name: "Browsers", value: formatRanking(stats.browsers), inline: false },
      { name: "Devices", value: formatRanking(stats.devices), inline: false }
    );
}

function formatRanking(rows) {
  if (!rows || rows.length === 0) {
    return "No visits yet";
  }

  return truncate(rows.map(function(row) {
    return sanitizeForDiscord(row.name, 80) + ": " + row.count;
  }).join("\n"), 1024);
}

module.exports = { buildLinkCreatedEmbed, buildVisitEmbed, buildStatsEmbed };
