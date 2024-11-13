const CORS = (req, res, next) => {
  // if (req.path !== "/" && !req.path.includes(".")) {
    res.set({
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Origin": "http://localhost:26485",
      "Access-Control-Allow-Headers": "X-Requested-With,Content-Type",
      "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
      "Content-Type": "application/json; charset=utf-8",
    });
  // }
  req.method === "OPTIONS" ? res.status(204).end() : next();
};

const cookieParser = (req, _, next) => {
  req.cookies = {};
  (req.headers.cookie || "").split(/;\s+|(?<!\s)\s+$/g).forEach((pair) => {
    let crack = pair.indexOf("=");
    if (crack < 1 || crack == pair.length - 1) return;
    req.cookies[decodeURIComponent(pair.slice(0, crack)).trim()] =
      decodeURIComponent(pair.slice(crack + 1)).trim();
  });
  next();
};

module.exports.CORS = CORS;
module.exports.cookieParser = cookieParser;
