function mapLink(row) {
  if (!row) return null;
  return {
    code: row.code,
    destinationUrl: row.destination_url,
    createdBy: row.created_by,
    createdInChannel: row.created_in_channel,
    createdAt: row.created_at,
    active: Boolean(row.active),
    totalVisits: row.total_visits,
    lastVisitAt: row.last_visit_at
  };
}

function createLinkRepository(db) {
  return {
    create: function(link) {
      db.prepare(`
        insert into links (code, destination_url, created_by, created_in_channel, created_at, active, total_visits)
        values (@code, @destinationUrl, @createdBy, @createdInChannel, @createdAt, 1, 0)
      `).run(link);
      return this.findByCode(link.code);
    },
    findByCode: function(code) {
      return mapLink(db.prepare("select * from links where code = ?").get(code));
    },
    markInactive: function(code) {
      return db.prepare("update links set active = 0 where code = ?").run(code);
    },
    listByUser: function(userId, limit) {
      return db.prepare("select * from links where created_by = ? order by created_at desc limit ?").all(userId, limit).map(mapLink);
    },
    incrementVisit: function(code, createdAt) {
      db.prepare("update links set total_visits = total_visits + 1, last_visit_at = ? where code = ?").run(createdAt, code);
    }
  };
}

module.exports = { createLinkRepository };
