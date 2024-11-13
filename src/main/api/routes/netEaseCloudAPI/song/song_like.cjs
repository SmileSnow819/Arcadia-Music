// 歌曲是否喜爱
const request = require('../util/request.cjs')

exports.url = "/song/like";
exports.fn = async (req, res) => {
  const query = req.body;
  const url = "/api/radio/like";
  if (!query.id) throw new Error("Need a id");
  const data = {
    alg: "itembased",
    trackId: query.id,
    like: query.like,
    time: "3",
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
