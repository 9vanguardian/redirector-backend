const express = require("express");

function createHealthRoutes(context) {
  const router = express.Router();

  router.get("/", function(req, res) {
    let storage = "ok";

    try {
      context.database.health();
    } catch (error) {
      storage = "error";
    }

    res.json({
      ok: storage === "ok",
      service: "running",
      discord: context.discord.status(),
      storage,
      env: context.env.NODE_ENV
    });
  });

  return router;
}

module.exports = { createHealthRoutes };
