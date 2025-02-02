const request = require('../util/request.cjs')

exports.url = '/login/qr/check'
exports.fn = async (req, res) => {
  const url = '/api/login/qrcode/client/login'
  const query = req.body
  if (!query.key) throw new Error('Need a key')
  const data = {
    key: query.key,
    type: 3
  }
  const options = {
    crypto: 'eapi',
    cookie: req.cookies,
    headers: {}
  }
  const answer = await request(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
