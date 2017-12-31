const _ = require('lodash')
var ObjectId = require('mongoose').Types.ObjectId

//import models
const { Todo } = require('../models/todos')

function getTodos(req, res, next) {
  var start = req.query.start || 0
  var limit = req.query.limit || 50
  var search = req.query.search || null

  if (_.isNaN(Number(start)) || _.isNaN(Number(limit))) {
    return next({
      message: 'Start and limit parameters must be a number.',
      status: 400
    })
  } else if (limit > 1000) {
    limit = 1000
  }

  if (req.query.removed == 'true') {
    var removed = true
  } else {
    var removed = false
  }

  Todo.list(start, limit, search, removed)
    .then((todos) => {
      return res.json({
        data: todos,
        status: 'ok'
      })
    })
    .catch((e) => {
      return next({
        message: e.message,
        status: e.status,
        stack: e
      })
    })
}

function getTodo(req, res, next) {
  var id = req.params.id

  Todo.get(id)
    .then((todo) => {
      return res.json({
        data: todo,
        status: 'ok'
      })
    })
    .catch((e) => {
      return next({
        message: e.message,
        status: e.status,
        stack: e
      })
    })
}

function createTodo(req, res) {
  //Do Data Validation
  if (!req.body.title) {
    return next({
      message: 'Title is required.',
      status: 400
    })
  }

  if (!req.body.description) {
    return next({
      message: 'Description is required.',
      status: 400
    })
  }

  var data = {
    title: _.trim(req.body.title),
    description: _.trim(req.body.description)
  }






  // var media = new Media(vals)
  //
  // media.save().then((doc) => {
  //   res.send(doc)
  // }, (e) => {
  //   console.log(e);
  //   res.status(500).json({error: e})
  // })






  // Todo.save(data)
  //   .then((todo) => {
  //     return res.json({
  //       data: todo,
  //       status: 'ok'
  //     })
  //   })
  //   .catch((e) => {
  //     return res.status(e.status).json({
  //       error: e.message,
  //       status: 'ok'
  //     })
  //   })





}

function updateTodo(req, res) {

}

function deleteTodo(req, res) {

}

module.exports = {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo
}
