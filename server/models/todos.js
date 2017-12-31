const mongoose = require('mongoose')
const Schema = mongoose.Schema
var ObjectId = mongoose.Types.ObjectId

var TodoSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  removed: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  }
})

TodoSchema.statics = {
  get(id) {
    if (ObjectId.isValid(id)) {
      return this.findById(id)
        .then((todo) => {
          if (!todo) {
            return Promise.reject({
              status: 400,
              message: 'Todo not found'
            })
          }

          return todo
        })
        .catch((e) => {
          return Promise.reject({
            status: e.status || 500,
            message: e.message || 'Internal Server Error',
            stack: e
          })
        })
    } else {
      return Promise.reject({
        status: 400,
        message: 'Invalid ID'
      })
    }
  }, //end get
  list(start, limit, search, removed) {
    query = {}

    if (!removed) {
      query.removed = false
    }

    if (search) {
      var search = decodeURIComponent(search)

      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") }
      ]
    }

    return this.find(query)
      .skip(Number(start))
      .limit(Number(limit))
      .then((todos) => {
        return todos
      })
      .catch((e) => {
        return Promise.reject({
          status: e.status || 500,
          message: e.message || 'Internal Server Error',
          stack: e
        })
      })
  }, //end list
  save(data) {
    return 'save'
  }, //end save
  delete(id) {
    return 'delete'
  } //end delete
} //end statics

var Todo = mongoose.model('Todo', TodoSchema)

module.exports = { Todo }
