// 创建歌单

const request = require('../util/request.cjs')

exports.url = "/playlist/create";
exports.fn = async (req, res) => {
  const url = "`/api/playlist/create";
  const query = req.body;
  if (!query.name) throw new Error("Need a name");
  const data = {
    name: query.name,
    privacy: query.privacy||0, //0 为普通歌单，10 为隐私歌单
    type: query.type || "NORMAL", // NORMAL|VIDEO|SHARED
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
