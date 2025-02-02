// 歌手专辑列表

const request = require('../util/request.cjs')

exports.url = "/artist/songs";
exports.fn = async (req, res) => {
  const query = req.body;
  if (!query.id) throw new Error("Need a artist id");
  const url = "/api/v1/artist/songs";
  const data = {
    id: query.id,
    private_cloud: "true",
    work_type: 1,
    order: query.order || "hot", //hot,time
    offset: query.offset || 0,
    limit: query.limit || 100,
  };
  const options = {
    crypto: "eapi",
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
