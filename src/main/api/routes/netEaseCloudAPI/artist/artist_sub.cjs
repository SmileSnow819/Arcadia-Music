// 已收藏专辑列表
const request = require('../util/request.cjs')

exports.url = '/artist/sub'
exports.fn = async (req, res) => {
  const query = req.body
  const url = '/api/artist/' + query.type
  const data = {
    artistId: query.id,
    artistIds: '[' + query.id + ']'
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  }
  const answer = await request(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
