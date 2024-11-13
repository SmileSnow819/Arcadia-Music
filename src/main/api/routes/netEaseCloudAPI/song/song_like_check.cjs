// 歌曲是否喜爱
const request = require('../util/request.cjs')

exports.url = "/song/likeCheck";
exports.fn = async (req, res) => {
  const query = req.body;
  const url = "/api/song/like/check";
  if (!query.ids) throw new Error("Need ids");
  const data = {
    trackIds: query.ids,
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