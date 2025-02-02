//添加删除回复评论
const request = require('../util/request.cjs')

exports.url = '/comments'
exports.fn = async (req, res) => {
  const query = req.body
  const url = `/api/resource/comments/${query.t}`

  const data = {
    threadId: 'R_SO_4_' + query.id
  }
  if (query.t == 'add') data.content = query.content
  else if (query.t == 'delete') data.commentId = query.commentId
  else if (query.t == 'reply') {
    data.commentId = query.commentId
    data.content = query.content
  }
  const options = {
    crypto: 'weapi',
    cookie: req.cookies,
    headers: {}
  }
  const answer = await request(url, data, options)
  return res.set('Set-Cookie', answer.cookie).status(answer.status).json(answer.data)
}
