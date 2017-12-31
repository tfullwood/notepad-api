const express = require('express')

//import controllers
var todoCtrl = require('../controllers/todos')

var router = express.Router()

router.get('/', todoCtrl.getTodos)

router.get('/:id', todoCtrl.getTodo)

router.post('/', todoCtrl.createTodo)

router.put('/:id', todoCtrl.updateTodo)

router.delete('/:id', todoCtrl.deleteTodo)

module.exports = router
