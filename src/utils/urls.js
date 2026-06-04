const { z } = require("zod");

const codeSchema = z.string().regex(/^[A-Za-z0-9_-]{6,32}$/);

function validateCode(code) {
  const result = codeSchema.safeParse(code);
  if (!result.success) {
    return null;
  }
  return result.data;
}

function validateDestinationUrl(value) {
  if (typeof value !== "string" || value.length > 2048) {
    throw new Error("Destination URL is invalid");
  }

  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch (error) {
    throw new Error("Destination URL is invalid");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }

  parsed.hash = parsed.hash;
  return parsed.toString();
}

function buildPublicLink(baseUrl, code) {
  return baseUrl.replace(/\/+$/, "") + "/" + encodeURIComponent(code);
}

module.exports = { validateCode, validateDestinationUrl, buildPublicLink };
