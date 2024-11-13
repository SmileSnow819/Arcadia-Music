// 歌手专辑列表

const request = require('../util/request.cjs')

exports.url = "/artist/albums";
exports.fn = async (req, res) => {
  const query = req.body;
  if (!query.id) throw new Error("Need a artist id");
  const url = `/api/artist/albums/${query.id}`;
  const data = {
    limit: query.limit || 50,
    offset: query.offset || 0,
    total: true,
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
