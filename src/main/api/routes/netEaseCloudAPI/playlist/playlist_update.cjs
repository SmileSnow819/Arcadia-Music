// 编辑歌单

const request = require('../util/request.cjs')

exports.url = "/playlist/update";
exports.fn = async (req, res) => {
  const url = "/api/batch";
  const query = req.body;
  if (!query.id) throw new Error("Need a id");
  if (!query.desc) throw new Error("Need a desc");
  // if (!query.tags) throw new Error("Need a tags");
  if (!query.name) throw new Error("Need a name");
  
  const data = {
    "/api/playlist/desc/update": `{"id":${query.id},"desc":"${query.desc}"}`,
    "/api/playlist/tags/update": `{"id":${query.id},"tags":"${query.tags}"}`,
    "/api/playlist/update/name": `{"id":${query.id},"name":"${query.name}"}`,
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
