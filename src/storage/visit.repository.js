function createVisitRepository(db) {
  return {
    create: function(visit) {
      db.prepare(`
        insert into visits (
          id, link_code, ip, country, city, isp, user_agent, browser, os, device_type,
          language, timezone, screen, referrer, consent, created_at
        )
        values (
          @id, @linkCode, @ip, @country, @city, @isp, @userAgent, @browser, @os, @deviceType,
          @language, @timezone, @screen, @referrer, @consent, @createdAt
        )
      `).run(visit);
    },
    statsForLink: function(code) {
      const countries = db.prepare(`
        select coalesce(country, 'Unknown') as name, count(*) as count
        from visits where link_code = ?
        group by coalesce(country, 'Unknown')
        order by count desc
        limit 5
      `).all(code);

      const browsers = db.prepare(`
        select coalesce(browser, 'Unknown') as name, count(*) as count
        from visits where link_code = ?
        group by coalesce(browser, 'Unknown')
        order by count desc
        limit 5
      `).all(code);

      const devices = db.prepare(`
        select coalesce(device_type, 'Unknown') as name, count(*) as count
        from visits where link_code = ?
        group by coalesce(device_type, 'Unknown')
        order by count desc
        limit 5
      `).all(code);

      return { countries, browsers, devices };
    }
  };
}

module.exports = { createVisitRepository };
