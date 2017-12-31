const express = require('express')

//import routes
var todoRoutes = require('./todos')
//var userRoutes = require('./users')

var router = express.Router()

//mount routes
router.use('/todo', todoRoutes)
//router.use('/user', userRoutes)

module.exports = router
