// 获取 VIP 信息


const request = require('../util/request.cjs')

exports.url = "/vip";
exports.fn = async (req, res) => {
  const url = "/api/music-vip-membership/client/vip/info";
  const query = req.body;
  if (!query.uid) throw new Error("Need a uid");
  const data = {
    userId: query.uid || "",
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
