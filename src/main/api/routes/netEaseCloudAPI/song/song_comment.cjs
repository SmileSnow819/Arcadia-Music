// 歌曲评论

const request = require('../util/request.cjs')

exports.url = '/song/comments'
exports.fn = async (req, res) => {
  const query = req.body;
  const url = `/api/v1/resource/comments/R_SO_4_${query.id}`
  const data = {
    rid: query.id,
    limit: query.limit || 20,
    offset: query.offset || 0,
    beforeTime: query.before || 0
  }
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
