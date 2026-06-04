const { Client, GatewayIntentBits } = require("discord.js");

function createDiscordClient(env) {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  return {
    client,
    getLogChannel: async function() {
      try {
        return await client.channels.fetch(env.DISCORD_CHANNEL_ID);
      } catch (error) {
        console.error("Discord log channel fetch failed: " + error.message);
        return null;
      }
    },
    status: function() {
      return client.isReady() ? "ready" : "not_ready";
    }
  };
}

module.exports = { createDiscordClient };
