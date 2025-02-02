// 私人FM - 模式选择

// aidj, DEFAULT, FAMILIAR, EXPLORE, SCENE_RCMD ( EXERCISE, FOCUS, NIGHT_EMO  )
// 来不及解释这几个了



const request = require('../util/request.cjs')

exports.url = "/fm/mode";
exports.fn = async (req, res) => {
  const url = "/api/v1/radio/get";
  const query = req.body;
  if (!query.mode) throw new Error("Need a mode");
  if (!query.submode) throw new Error("Need a submode");
  const data = {
    mode: query.mode,
    subMode: query.submode,
    limit: query.limit || 3,
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
