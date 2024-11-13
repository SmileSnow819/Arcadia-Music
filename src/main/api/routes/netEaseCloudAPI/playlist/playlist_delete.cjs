// 删除歌单


const request = require('../util/request.cjs')

exports.url = "/playlist/delete";
exports.fn = async (req, res) => {
  const url = "/api/playlist/remove";
  const query = req.body;
  if (!query.id) throw new Error("Need a id");
  const data = {
    ids: "[" + query.id + "]",
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
