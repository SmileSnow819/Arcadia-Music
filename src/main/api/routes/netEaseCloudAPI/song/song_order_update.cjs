// 歌曲详情

const request = require('../util/request.cjs')

exports.url = '/song/order/update'
exports.fn = async (req, res) => {
  const query = req.body
  const url = '/api/playlist/manipulate/tracks'
  if (!query.ids) throw new Error('Need ids')
  if (!query.pid) throw new Error('Need pid')
  const data = {
    pid: query.pid,
    trackIds: query.ids,
    op: 'update'
  }
  const options = {
    crypto: 'eapi',
    cookie: req.cookies,
    headers: {}
  }
  const answer = await request(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
