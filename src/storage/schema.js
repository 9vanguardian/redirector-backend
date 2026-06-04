function applySchema(db) {
  db.exec(`
    create table if not exists links (
      code text primary key,
      destination_url text not null,
      created_by text not null,
      created_in_channel text not null,
      created_at text not null,
      active integer not null default 1,
      total_visits integer not null default 0,
      last_visit_at text
    );

    create table if not exists visits (
      id text primary key,
      link_code text not null,
      ip text,
      country text,
      city text,
      isp text,
      user_agent text,
      browser text,
      os text,
      device_type text,
      language text,
      timezone text,
      screen text,
      referrer text,
      consent integer not null,
      created_at text not null,
      foreign key (link_code) references links(code)
    );

    create index if not exists visits_link_code_idx on visits(link_code);
    create index if not exists links_created_by_idx on links(created_by);
  `);
}

module.exports = { applySchema };
