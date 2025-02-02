// 音乐百科基础信息
const request = require('../util/request.cjs')

exports.url = "/song/wiki";
exports.fn = async (req, res) => {
  const query = req.body;
  const url = "/api/song/play/about/block/page";
  if (!query.id) throw new Error("Need id");
  const data = {
    songId: query.id,
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