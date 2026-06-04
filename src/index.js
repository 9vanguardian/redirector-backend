const { loadEnv } = require("./config/env");
const { createDatabase } = require("./storage/database");
const { createDiscordClient } = require("./discord/client");
const { registerCommands, attachInteractionHandlers } = require("./discord/handlers");
const { createServer } = require("./server");

async function main() {
  const env = loadEnv();
  const database = createDatabase(env);
  const discord = createDiscordClient(env);

  attachInteractionHandlers(discord, database, env);

  discord.client.once("ready", async function() {
    try {
      console.log("Discord bot ready as " + discord.client.user.tag);
      await registerCommands(discord, env);
    } catch (error) {
      console.error("Discord command registration failed: " + error.message);
    }
  });

  await discord.client.login(env.DISCORD_TOKEN);

  const app = createServer({ env, database, discord });

  app.listen(env.PORT, function() {
    console.log("HTTP server listening on port " + env.PORT);
  });
}

main().catch(function(error) {
  console.error("Startup failed: " + error.message);
  process.exit(1);
});
