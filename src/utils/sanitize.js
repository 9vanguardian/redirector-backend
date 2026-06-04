function truncate(value, maxLength) {
  const text = value == null ? "" : String(value);
  return text.length > maxLength ? text.slice(0, maxLength - 1) + "..." : text;
}

function sanitizeForDiscord(value, maxLength) {
  return truncate(value, maxLength || 1024)
    .replace(/@/g, "@\u200b")
    .replace(/`/g, "'")
    .replace(/\r?\n/g, " ")
    .trim() || "Not available";
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clampString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

module.exports = { sanitizeForDiscord, escapeHtml, clampString, truncate };
