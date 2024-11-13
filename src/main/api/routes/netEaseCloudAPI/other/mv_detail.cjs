// MV详情

const request = require('../util/request.cjs')

exports.url = "/mv";
exports.fn = async (req, res) => {
  const url = "/api/v1/mv/detail";
  const query = req.body;
  if (!query.id) throw new Error("Need a id");
  const data = {
    id: query.id,
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
