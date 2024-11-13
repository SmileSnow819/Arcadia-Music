// 搜索建议

const request = require('../util/request.cjs')

exports.url = "/search/suggest";
exports.fn = async (req, res) => {
  const query = req.body;
  const url = "/api/search/suggest/";
  if (!query.keywords) throw new Error("Need a keywords");
  const data = {
    s: query.keywords || "",
  };
  let type = query.type == "mobile" ? "keyword" : "web";
  const options = {
    crypto: "weapi",
    cookie: req.cookies,
    headers: {},
  };
  const answer = await request(url + "/" + type, data, options);
  return res
    .set("Set-Cookie", answer.cookie)
    .status(answer.status)
    .json(answer.data);
};
