// 用户歌单


const request = require('../util/request.cjs')
exports.url = "/user/playlist";
exports.fn = async (req, res) => {
  const url = "/api/user/playlist";
  const query = req.body;
  if (!query.uid) throw new Error("Need a uid");
  const data = {
    uid: query.uid,
    limit: query.limit || 30,
    offset: query.offset || 0,
    includeVideo: true,
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
