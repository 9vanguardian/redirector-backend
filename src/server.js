const express = require("express");
const helmet = require("helmet");
const { createRedirectRoutes } = require("./routes/redirect.routes");
const { createLogRoutes } = require("./routes/log.routes");
const { createHealthRoutes } = require("./routes/health.routes");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/error");

function createServer(context) {
  const app = express();

  app.set("trust proxy", context.env.TRUST_PROXY);
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({ limit: "20kb" }));

  app.use("/health", createHealthRoutes(context));
  app.use("/api/visits", createLogRoutes(context));
  app.use("/", createRedirectRoutes(context));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createServer };
