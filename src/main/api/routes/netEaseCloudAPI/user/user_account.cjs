const request = require('../util/request.cjs')

exports.url = '/user/account'
exports.fn = async (req, res) => {
  const url = '/api/nuser/account/get'
  const data = {}
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  }
  const answer = await request(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
