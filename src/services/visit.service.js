const crypto = require("crypto");
const { z } = require("zod");
const { getClientIp } = require("../utils/ip");
const { parseUserAgent } = require("../utils/userAgent");
const { clampString } = require("../utils/sanitize");
const { nowIso } = require("../utils/time");
const { lookupGeo } = require("./geo.service");

const visitBodySchema = z.object({
  code: z.string().regex(/^[A-Za-z0-9_-]{6,32}$/),
  consent: z.literal(true),
  language: z.string().max(80).optional(),
  timezone: z.string().max(120).optional(),
  screen: z.string().max(40).optional(),
  referrer: z.string().max(500).optional()
});

function createVisitService(database) {
  return {
    recordVisit: async function(req) {
      const body = visitBodySchema.parse(req.body);
      const link = database.links.findByCode(body.code);

      if (!link || !link.active) {
        const error = new Error("Link not found");
        error.status = 404;
        throw error;
      }

      const userAgent = clampString(req.get("user-agent"), 500);
      const parsedUserAgent = parseUserAgent(userAgent);
      const geo = await lookupGeo(getClientIp(req));
      const createdAt = nowIso();

      const visit = {
        id: crypto.randomUUID(),
        linkCode: link.code,
        ip: clampString(getClientIp(req), 80),
        country: clampString(geo.country, 100),
        city: clampString(geo.city, 100),
        isp: clampString(geo.isp, 160),
        userAgent,
        browser: clampString(parsedUserAgent.browser, 120),
        os: clampString(parsedUserAgent.os, 120),
        deviceType: clampString(parsedUserAgent.deviceType, 40),
        language: clampString(body.language, 80),
        timezone: clampString(body.timezone, 120),
        screen: clampString(body.screen, 40),
        referrer: clampString(body.referrer, 500),
        consent: 1,
        createdAt
      };

      database.raw.transaction(function() {
        database.visits.create(visit);
        database.links.incrementVisit(link.code, createdAt);
      })();

      return { link, visit };
    }
  };
}

module.exports = { createVisitService };
