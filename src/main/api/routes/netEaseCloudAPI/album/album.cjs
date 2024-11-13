// 专辑内容

const request = require('../util/request.cjs')

exports.url = "/album/detail";
exports.fn = async (req, res) => {
  const query = req.body;
  if (!query.id) throw new Error("Need a album id");
  const url = `/api/v1/album/${query.id}`;
  const data = {
    id: query.id,
  };
  const options = {
    crypto: "weapi",
    cookie: req.cookies,
    headers: {},
  };
  const answer = await request(url, data, options);

  const tracksID = answer.data.songs.map((item) => {
    return { id: item.id };
  });

  const idsData = {
    c: JSON.stringify(tracksID),
  };
  const optionsTracks = {
    crypto: "weapi",
    cookie: req.cookies,
    headers: {},
  };
  const answerTracks = await request(
    "/api/v3/song/detail",
    idsData,
    optionsTracks
  );
  answer.data.songs = answerTracks.data.songs;

  return res
    .set("Set-Cookie", answerTracks.cookie)
    .status(answerTracks.status)
    .json(answer.data);
};
