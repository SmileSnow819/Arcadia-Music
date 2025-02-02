// 每日推荐歌曲

const request = require('../util/request.cjs')

exports.url = "/recommend/songs";
exports.fn = async (req, res) => {
  const url = "/api/v3/discovery/recommend/songs";
  const data = {};
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
