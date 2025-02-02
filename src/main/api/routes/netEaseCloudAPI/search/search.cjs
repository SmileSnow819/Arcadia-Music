// 搜索



const request = require('../util/request.cjs')

exports.url = "/search";
exports.fn = async (req, res) => {
  const query = req.body;
  const url = "/api/search/get";
  if (!query.keywords) throw new Error("Need a keywords");
  if (!query.type) throw new Error("Need a type {1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频}");
  const data = {
    s: query.keywords,
    type: query.type , // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
    limit: query.limit || 30,
    offset: query.offset || 0,
  };
  const options = {
    crypto: "eapi",
    cookie: req.cookies,
    headers: {},
  };
  const answer = await request(url, data, options);
  return res
    .set("Set-Cookie", answer.cookie)
    .status(answer.status)
    .json(answer.data);
};
