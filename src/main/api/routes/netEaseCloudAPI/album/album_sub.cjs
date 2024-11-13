// 收藏/取消收藏专辑

const request = require("../util/request.cjs");

exports.url = "/album/sub";
exports.fn = async (req, res) => {
  const query = req.body;
  if (!query.id) throw new Error("Need a album id");
  if (!query.type) throw new Error("Need a type{sub unsub}");
  const url = `/api/album/${query.type}`;
  const data = {
    id: query.id,
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
