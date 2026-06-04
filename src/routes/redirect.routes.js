const express = require("express");
const rateLimit = require("express-rate-limit");
const { createLinkService } = require("../services/link.service");
const { validateCode } = require("../utils/urls");
const { buildConsentPage, buildMissingLinkPage } = require("../views/consentPage");

function createRedirectRoutes(context) {
  const router = express.Router();
  const links = createLinkService(context.database);

  router.get("/:code", rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false }), function(req, res) {
    const code = validateCode(req.params.code);

    if (!code) {
      return res.status(404).send(buildMissingLinkPage());
    }

    const link = links.getActiveLink(code);
    if (!link) {
      return res.status(404).send(buildMissingLinkPage());
    }

    res.set("Content-Type", "text/html; charset=utf-8");
    return res.send(buildConsentPage(link));
  });

  return router;
}

module.exports = { createRedirectRoutes };
