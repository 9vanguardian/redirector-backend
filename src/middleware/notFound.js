function notFound(req, res) {
  res.status(404).send("<!doctype html><html><head><meta charset=\"utf-8\"><title>Not found</title></head><body><h1>Link not found</h1><p>The requested resource is not available.</p></body></html>");
}

module.exports = { notFound };
