// 歌手单曲

const request = require('../util/request.cjs')

exports.url = "/artist";
exports.fn = async (req, res) => {
  const query = req.body;
  if (!query.id) throw new Error("Need a artist id");
  const url = `/api/v1/artist/${query.id}`;
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
