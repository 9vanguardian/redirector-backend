const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { applySchema } = require("./schema");
const { createLinkRepository } = require("./link.repository");
const { createVisitRepository } = require("./visit.repository");

function createDatabase(env) {
  const databasePath = path.resolve(env.DATABASE_PATH);
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const db = new Database(databasePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  applySchema(db);

  return {
    raw: db,
    links: createLinkRepository(db),
    visits: createVisitRepository(db),
    health: function() {
      db.prepare("select 1 as ok").get();
      return "ok";
    }
  };
}

module.exports = { createDatabase };
