// 专辑简要百科信息

const request = require('../util/request.cjs')

exports.url = "/album/wiki";
exports.fn = async (req, res) => {
  const url = "/api/rep/ugc/album/get";
  const query = req.body;
  if (!query.id) throw new Error("Need a id");
  const data = {
    albumId: query.id,
  };
  const options = {
    crypto: "eapi",
    cookie: req.cookies,
    headers: {},
  };
  const answer = await request(url, data, options);
  return res
    .set("Set-Cookie", answer.cookie)
    .status(answer.status)
    .json(answer.data);
};
