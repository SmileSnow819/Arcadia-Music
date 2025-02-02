// 收藏单曲到歌单 从歌单删除歌曲

const request = require('../util/request.cjs')

exports.url = "/playlist/tracks";
exports.fn = async (req, res) => {
  const url = "/api/playlist/manipulate/tracks";
  const query = req.body;
  if (!query.op) throw new Error("Need a op {del or add}");
  if (!query.pid) throw new Error("Need a pid");
  if (!query.tracks) throw new Error("Need a tracks");
  const data = {
    op: query.op, // del,add
    pid: query.pid, // 歌单id
    trackIds: JSON.stringify(query.tracks), // 歌曲id
    tracks:"[object Object]",
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
