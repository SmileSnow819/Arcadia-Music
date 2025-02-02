// MV链接

const request = require('../util/request.cjs')

exports.url = "/mv/url";
exports.fn = async (req, res) => {
  const url = "/api/song/enhance/play/mv/url";
  const query = req.body;
  if (!query.id) throw new Error("Need a id");
  const data = {
    id: query.id,
    r: query.r || 1080,
  };
  const options = {
    crypto: "weapi",
    cookie: req.cookies,
    headers: {},
  };
  const answer = await request(url, data, options);
  return res
    .set("Set-Cookie", answer.cookie)
    .status(answer.status)
    .json(answer.data);
};

