const request = require('../util/request.cjs')

exports.url = '/login/qr/key'
exports.fn = async (req, res) => {
  const url = '/api/login/qrcode/unikey'
  const data = {
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
