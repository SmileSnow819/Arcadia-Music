// 新版歌词 - 包含逐字歌词


const request = require('../util/request.cjs')

exports.url = "/lyric";
exports.fn = async (req, res) => {
  const url = "/api/song/lyric/v1";
  const query = req.body;
  if (!query.id) throw new Error("Need a id");
  const data = {
    id: query.id,
    cp: false,
    tv: 0,
    lv: 0,
    rv: 0,
    kv: 0,
    yv: 0,
    ytv: 0,
    yrv: 0,
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
