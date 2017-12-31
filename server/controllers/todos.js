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
} //end getTodos

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
} //end getTodo

function createTodo(req, res, next) {
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

  var todo = new Todo(data)

  todo.save()
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
} //end createTodo

function updateTodo(req, res, next) {
  var id = req.params.id

  Todo.get(id)
    .then((todo) => {
      //data validation
      if (!req.body.title && !req.body.description && !req.body.completed && !req.body.removed) {
        return next({
          message: 'Title, description, or completed status are required.',
          status: 400
        })
      }

      if (req.body.title) {
        todo.title = _.trim(req.body.title)
      }
      if (req.body.description) {
        todo.description = _.trim(req.body.description)
      }

      if (req.body.completed == 'true') {
        todo.completed = true
      } else {
        todo.completed = false
      }

      //unflag removed record - to flag as deleted use DELETE /api/todo/:id
      if (req.body.removed == 'false') {
        todo.removed = false
      }

      todo.save()
        .then((todo) => {
          return res.json({
            data: todo,
            status: 'ok'
          })
        })
        .catch((e) => {
          return next({
            status: 500,
            message: 'Failed to update todo. Internal server error.',
            stack: e
          })
        })
    })
    .catch((e) => {
      return next({
        message: e.message,
        status: e.status,
        stack: e
      })
    })
} //end updateTodo

function deleteTodo(req, res, next) {
  var id = req.params.id

  if (req.query.frd == 'true') {
    //actually remove from the db

    Todo.delete(id)
      .then((doc) => {
        res.json({
          message: `Successfully removed todo ${id}`,
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
  } else {
    //find record and flag as removed
    Todo.get(id)
      .then((todo) => {
        todo.removed = true

        todo.save()
          .then((todo) => {
            return res.json({
              data: todo,
              status: 'ok'
            })
          })
          .catch((e) => {
            return next({
              status: 500,
              message: 'Failed to update todo. Internal server error.',
              stack: e
            })
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
}

module.exports = {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo
}
