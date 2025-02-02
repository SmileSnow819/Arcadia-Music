// 退出登录
const request = require('../util/request.cjs')

exports.url = "/logout";
exports.fn = async (req, res) => {
  const url = "/api/logout";
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
