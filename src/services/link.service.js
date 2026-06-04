const crypto = require("crypto");
const { validateDestinationUrl } = require("../utils/urls");
const { nowIso } = require("../utils/time");

function generateCode() {
  return crypto.randomBytes(9).toString("base64url");
}

function createLinkService(database) {
  return {
    createLink: function(input) {
      const destinationUrl = validateDestinationUrl(input.destinationUrl);
      let code = generateCode();

      while (database.links.findByCode(code)) {
        code = generateCode();
      }

      return database.links.create({
        code,
        destinationUrl,
        createdBy: input.createdBy,
        createdInChannel: input.createdInChannel,
        createdAt: nowIso()
      });
    },
    getActiveLink: function(code) {
      const link = database.links.findByCode(code);
      if (!link || !link.active) {
        return null;
      }
      return link;
    },
    getLink: function(code) {
      return database.links.findByCode(code);
    },
    deleteLink: function(code) {
      return database.links.markInactive(code);
    },
    listLinks: function(userId, limit) {
      return database.links.listByUser(userId, limit);
    }
  };
}

module.exports = { createLinkService };
