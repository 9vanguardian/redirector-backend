function getClientIp(req) {
  return req.ip || req.socket.remoteAddress || "";
}

module.exports = { getClientIp };
