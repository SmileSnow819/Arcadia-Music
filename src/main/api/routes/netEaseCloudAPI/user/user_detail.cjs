// 用户详情

const request = require('../util/request.cjs')

exports.url = "/user/detail";
exports.fn = async (req, res) => {
  const url = "/api/v1/user/detail";
  const query = req.body;
  const data = {};
  if (!query.uid) throw new Error("Need a uid");
  const options = {
    crypto: "weapi",
    cookie: req.cookies,
    headers: {},
  };
  const answer = await request(url + "/" + query.uid, data, options);
  return res
    .set("Set-Cookie", answer.cookie)
    .status(answer.status)
    .json(answer.data);
};
