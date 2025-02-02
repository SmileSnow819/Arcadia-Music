// 获取客户端歌曲下载链接 - v1
// 此版本不再采用 br 作为音质区分的标准
// 而是采用 standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带) 进行音质判断

const request = require('../util/request.cjs')

exports.url = "/song/download";
exports.fn = async (req, res) => {
  const query = req.body;
  const url = "/api/song/enhance/download/url/v1";
  if (!query.id) throw new Error("Need a id");
  if (!query.level) throw new Error(
    "Need level { standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带)}"
  );
  const data = {
    id: query.id,
    immerseType: "c51",
    level: query.level,
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
