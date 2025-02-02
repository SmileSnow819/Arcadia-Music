const request = require('../util/request.cjs')

exports.url = '/login/status'
exports.fn = async (req, res) => {
  const url = '/api/w/nuser/account/get'
  const data = {}
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  }
  const answer = await request(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
