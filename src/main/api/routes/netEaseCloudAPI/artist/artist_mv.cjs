// 歌手相关MV

const request = require('../util/request.cjs')

exports.url = "/artist/mv";
exports.fn = async (req, res) => {
  const query = req.body;
  if (!query.id) throw new Error("Need a artist id");
  const url = "/api/artist/mvs/";
  const data = {
    artistId: query.id,
    limit: query.limit||30,
    offset: query.offset||0,
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