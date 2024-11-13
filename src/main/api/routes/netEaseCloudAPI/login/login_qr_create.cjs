const QRCode = require('qrcode')

exports.url = '/login/qr/create'
exports.fn = async (req, res) => {
  const query = req.body
  if (!query.unikey) throw new Error('Need a unikey')
  const url = `https://music.163.com/login?codekey=${query.unikey}`

  const answer = {
    qrurl: url,
    qrimg: await QRCode.toDataURL(url)
  }
  return res.status(200).json(answer)
}
