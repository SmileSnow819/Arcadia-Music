const express = require('express')
const errorHandler = require('./controllers/errorHandler.cjs')
const { CORS, cookieParser } = require('./routes/netEaseCloudAPI/util/toolMiddleWare.cjs')
const netEaseCloudAPI = require('./routes/netEaseCloudRouter.cjs')
// const bilibiliAPI = require("./routes/bilibiliRouter.js");
const app = express()

app.use(CORS)
app.use(cookieParser)
app.use(express.json())
// app.use(express.static())
app.use('/netEaseCloud', netEaseCloudAPI)
app.use('/', (req, res, next) => {
  res.status(404).json({
    state: 'error',
    message: `404 not found path: ${req.path}`
  })
})
// app.use("/Bilibili", bilibiliAPI);
app.use(errorHandler)
module.exports = app
