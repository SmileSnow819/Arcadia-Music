// 听歌排行
const request = require('../util/request.cjs')

exports.url = "/user/record";
exports.fn = async (req, res) => {
  const url = "/api/v1/play/record";
  const query = req.body;
  if (!query.uid) throw new Error("Need a uid");
  const data = {
    uid: query.uid,
    type: query.type || 0, // 1: 最近一周, 0: 所有时间
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
