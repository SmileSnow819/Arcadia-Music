// 已收藏专辑列表
const request = require('../util/request.cjs')

exports.url = "/artist/sublist";
exports.fn = async (req, res) => {
  const query = req.body;
  const url = "/api/artist/sublist";
  const data = {
    limit: query.limit || 100,
    offset: query.offset || 0,
    total: true,
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
