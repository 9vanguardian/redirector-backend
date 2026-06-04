const express = require("express");
const rateLimit = require("express-rate-limit");
const { createVisitService } = require("../services/visit.service");
const { buildVisitEmbed } = require("../discord/embeds");
const { validateDestinationUrl } = require("../utils/urls");

function createLogRoutes(context) {
  const router = express.Router();
  const visits = createVisitService(context.database);

  router.post("/", rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }), async function(req, res, next) {
    try {
      const result = await visits.recordVisit(req);
      const redirectTo = validateDestinationUrl(result.link.destinationUrl);
      sendVisitLog(context.discord, result.link, result.visit);
      res.json({ ok: true, redirectTo });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

async function sendVisitLog(discord, link, visit) {
  try {
    const channel = await discord.getLogChannel();
    if (!channel) {
      console.error("Discord log channel is not available");
      return;
    }

    await channel.send({
      embeds: [buildVisitEmbed(link, visit)],
      allowedMentions: { parse: [] }
    });
  } catch (error) {
    console.error("Discord visit log failed: " + error.message);
  }
}

module.exports = { createLogRoutes };
