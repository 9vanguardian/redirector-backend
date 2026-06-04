const dotenv = require("dotenv");
const { z } = require("zod");

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  BASE_URL: z.string().url(),
  DISCORD_TOKEN: z.string().min(20),
  DISCORD_CHANNEL_ID: z.string().regex(/^\d{10,30}$/),
  TRUST_PROXY: z
    .enum(["true", "false", "1", "0"])
    .default("false")
    .transform(function(value) {
      return value === "true" || value === "1";
    }),
  DATABASE_PATH: z.string().min(1).default("data/redirector.sqlite")
});

function loadEnv() {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const fields = result.error.issues.map(function(issue) {
      return issue.path.join(".");
    }).join(", ");

    throw new Error("Invalid environment configuration: " + fields);
  }

  const env = result.data;
  env.BASE_URL = env.BASE_URL.replace(/\/+$/, "");
  return env;
}

module.exports = { loadEnv };
