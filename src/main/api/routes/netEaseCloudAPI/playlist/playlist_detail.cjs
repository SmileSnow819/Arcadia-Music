// 歌单详情

const request = require('../util/request.cjs')

exports.url = "/playlist/detail";
exports.fn = async (req, res) => {
  const url = "/api/v6/playlist/detail";
  const query = req.body;
  if (!query.id) throw new Error("Need a id");
  const data = {
    id: query.id,
    n:  query.limit,
    s: query.s || 8,
  };
  const options = {
    crypto: "eapi",
    cookie: req.cookies,
    headers: {},
  };

  const answer = await request(url, data, options);
  // const offset = query.offset || 0;
  // const limit = query.limit || answer.data.playlist.trackIds.length;
  // const trackIds = answer.data.playlist.trackIds;
  // let idsData = {
  //   c: JSON.stringify(
  //     trackIds.slice(offset, offset + limit).map((item) => {
  //       return { id: item.id };
  //     })
  //   ),
  // };
  // const optionsTracks = {
  //   crypto: "weapi",
  //   cookie: req.cookies,
  //   headers: {},
  // };
  // const answerTracks = await request(
  //   "/api/v3/song/detail",
  //   idsData,
  //   optionsTracks
  // );
  // answer.data.playlist.tracks = answerTracks.data.songs;


  
  return res
    .set("Set-Cookie", answer.cookie)
    .status(answer.status)
    .json(answer.data);
};
