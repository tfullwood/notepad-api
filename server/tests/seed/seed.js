const { ObjectID } = require('mongodb')

const { Todo } = require('../../models/todos')

const todoIdOne = new ObjectID
const todoIdTwo = new ObjectID
const todoIdThree = new ObjectID

const todos = [{
    _id: todoIdOne,
    title: 'Test Todo Title 1',
    description: 'Test todo description 1'
  }, {
    _id: todoIdTwo,
    title: 'Test Todo Title 2',
    description: 'Test todo description 2'
  }, {
    _id: todoIdThree,
    title: 'Test Todo Title 3',
    description: 'Test todo description 3',
    removed: true
  }
]

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => done())
}

module.exports = {
  todos,
  populateTodos
}
