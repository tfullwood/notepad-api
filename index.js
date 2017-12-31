require('./config/config')

const express = require('express')
const mongoose = require('mongoose')
const _ = require('lodash')
const bodyParser = require('body-parser')
const path = require('path')

//Import Routes
var routes = require('./server/routes/index')

//Import Middleware
const errMiddleware = require('./server/middleware/error')

//Connect Mongoose
mongoose.Promise = global.Promise

mongoose.connect(process.env.MONGODB_URI, {
  useMongoClient: true
})
  .then(() => {
    console.log('MongoDB Connected')
  })
  .catch((e) => {
    console.log(e)
  })

var app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Setup the documentation endpoint
app.use('/api/docs', express.static(path.join(__dirname, 'docs')))

app.use('/api', routes)

//Setup the error handling
app.use(errMiddleware)

app.listen(port, () => {
  console.log(`Server launched on port ${port}`)
})

module.exports = { app }
