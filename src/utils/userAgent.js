const UAParser = require("ua-parser-js");

function parseUserAgent(userAgent) {
  const parsed = new UAParser(userAgent || "").getResult();
  const browser = [parsed.browser.name, parsed.browser.version].filter(Boolean).join(" ");
  const os = [parsed.os.name, parsed.os.version].filter(Boolean).join(" ");
  const deviceType = parsed.device.type || "desktop";

  return {
    browser: browser || "Unknown",
    os: os || "Unknown",
    deviceType
  };
}

module.exports = { parseUserAgent };
