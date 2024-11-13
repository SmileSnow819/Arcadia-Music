// 编辑歌单顺序


const request = require('../util/request.cjs')

exports.url = "/playlist/order/update";
exports.fn = async (req, res) => {
  const url = "/api/playlist/order/update";
  const query = req.body;
  if (!query.ids) throw new Error("Need ids");
  const data = {
    ids: query.ids,
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
