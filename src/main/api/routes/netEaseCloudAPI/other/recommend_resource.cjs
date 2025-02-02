// 每日推荐歌单

const request = require('../util/request.cjs')

exports.url = "/recommend/playlists";
exports.fn = async (req, res) => {
  const url = "/api/v1/discovery/recommend/resource";
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

