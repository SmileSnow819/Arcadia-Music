// 首页-发现 block page
// 这个接口为移动端接口，首页-发现页，数据结构可以参考 https://github.com/hcanyz/flutter-netease-music-api/blob/master/lib/src/api/uncategorized/bean.dart#L259 HomeBlockPageWrap
// query.refresh 是否刷新数据
const request = require('../util/request.cjs')

exports.url = "/homepage";
exports.fn = async (req, res) => {
  const url = "/api/homepage/block/page";
  const query = req.body;
  if (!query.id) throw new Error("Need a id");
  const data = { refresh: query.refresh || false, cursor: query.cursor };
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
