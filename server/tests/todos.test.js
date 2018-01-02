const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')
const _ = require('lodash')

const { app } = require('../../index')
const { Todo } = require('../models/todos')
const { todos, populateTodos } = require('./seed/seed')

beforeEach(populateTodos)

describe('todo get endpoints', () => {
  it('should get todo results', (done) => {
    request(app)
      .get('/api/todo')
      //.set('x-auth', users[0].tokens[0].token)
      .set('Accept', 'application/json; charset=utf-8')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(2)
        //just spot check one of the values
        expect(res.body.data[0].title).toBe(todos[0].title)

        expect(res.body.status).toBe('ok')
      })
      .end(done)
  }) //end should get todos

  it('should get todo results including removed', (done) => {
    request(app)
      .get('/api/todo?removed=true')
      //.set('x-auth', users[0].tokens[0].token)
      .set('Accept', 'application/json; charset=utf-8')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.length).toBe(3)
        //just spot check one of the values
        expect(res.body.data[2].title).toBe(todos[2].title)

        expect(res.body.status).toBe('ok')
      })
      .end(done)
  }) //end should get todos include removed

  it('should error due to bad start parameter', (done) => {
    request(app)
      .get('/api/todo?start=abc')
      //.set('x-auth', users[0].tokens[0].token)
      .set('Accept', 'application/json; charset=utf-8')
      .expect(400)
      .expect((res) => {
        expect(res.body.status).toBe('error')
        expect(res.body.message).toBe('Start and limit parameters must be a number.')
      })
      .end(done)
  }) //end should error due to bad start parameter

  it('should error due to bad limit parameter', (done) => {
    request(app)
      .get('/api/todo?limit=abc')
      //.set('x-auth', users[0].tokens[0].token)
      .set('Accept', 'application/json; charset=utf-8')
      .expect(400)
      .expect((res) => {
        expect(res.body.status).toBe('error')
        expect(res.body.message).toBe('Start and limit parameters must be a number.')
      })
      .end(done)
  }) //end should error due to bad limit parameter

  it('should get one todo', (done) => {
    request(app)
      .get(`/api/todo/${todos[1]._id}`)
      //.set('x-auth', users[0].tokens[0].token)
      .set('Accept', 'application/json; charset=utf-8')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.title).toBe(todos[1].title)
        expect(res.body.data.description).toBe(todos[1].description)
        expect(res.body.data.removed).toBeFalsy()
        expect(res.body.data.completed).toBeFalsy()

        expect(res.body.status).toBe('ok')
      })
      .end(done)
  }) //end should get todo
}) //end get endpoints

describe('todo post endpoint', () => {
  it('should add a todo record to the database', (done) => {
    var title = 'Test todo 4 title'
    var description = 'Test todo 4 description'

    request(app)
      .post('/api/todo')
      .set('Content-Type', 'application/json')
      .send({
        title,
        description
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data._id).toEqual(expect.anything())
        expect(res.body.data.title).toBe(title)
        expect(res.body.data.description).toBe(description)
      })
      .end((err) => {
        if (err) {
          return done(err)
        }

        Todo.findOne({title}).then((todo) => {
          expect(todo).toEqual(expect.anything())
          expect(todo.title).toBe(title)
          done()
        }).catch((e) => done(e))
      })
  }) //end should post

  it('should fail to post due to missing title', (done) => {
    var description = 'Test todo 4 description'

    request(app)
      .post('/api/todo')
      .set('Content-Type', 'application/json')
      .send({
        description
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Title is required.')
      })
      .end(done)
  }) //end should fail to post due to missing title

  it('should fail to post due to missing description', (done) => {
    var title = 'Test todo 4 title'

    request(app)
      .post('/api/todo')
      .set('Content-Type', 'application/json')
      .send({
        title
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Description is required.')
      })
      .end(done)
  }) //end should fail to post due to missing title

  it('should add a todo and validate trim', (done) => {
    var title = ' Test todo 4 title '
    var description = ' Test todo 4 description '
    var validatedTitle = _.trim(title)
    var validatedDescription = _.trim(description)

    request(app)
      .post('/api/todo')
      .set('Content-Type', 'application/json')
      .send({
        title,
        description
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data._id).toEqual(expect.anything())
        expect(res.body.data.title).toBe(validatedTitle)
        expect(res.body.data.description).toBe(validatedDescription)
      })
      .end((err) => {
        if (err) {
          return done(err)
        }

        Todo.findOne({title: validatedTitle}).then((todo) => {
          expect(todo).toEqual(expect.anything())
          expect(todo.title).toBe(validatedTitle)
          done()
        }).catch((e) => done(e))
      })
  }) //end should add a todo and validate trim
})

describe('todo put endpoint', () => {
  it('should update a media record', (done) => {
    var title = 'New Title'
    var description = 'New description'

    request(app)
      .put(`/api/todo/${todos[0]._id}`)
      .set('Content-Type', 'application/json')
      .send({
        title,
        description
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.title).toBe(title)
        expect(res.body.data.description).toBe(description)
        expect(res.body.data.removed).toBeFalsy()
        expect(res.body.data.completed).toBeFalsy()
      })
      .end((err) => {
        if (err) {
          return done(err)
        }

        //Verify value in DB
        Todo.findOne({title}).then((todo) => {
          expect(todo).toEqual(expect.anything())
          expect(todo.title).toBe(title)
          expect(todo.description).toBe(description)
          expect(todo.removed).toBeFalsy()
          expect(todo.completed).toBeFalsy()

          done()
        }).catch((e) => done(e))
      })
  }) //end should update

  it('should fail to update a record due to missing data', (done) => {
    request(app)
      .put(`/api/todo/${todos[0]._id}`)
      .set('Content-Type', 'application/json')
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.status).toBe('error')
        expect(res.body.message).toBe('Title, description, or completed status are required.')
      })
      .end(done)
  }) //end should fail to update

  it('should update, validate trim, and validate completed true', (done) => {
    var title = ' New Title '
    var description = ' New Description '
    var validatedTitle = _.trim(title)
    var validatedDescription = _.trim(description)

    request(app)
      .put(`/api/todo/${todos[0]._id}`)
      .set('Content-Type', 'application/json')
      .send({
        title,
        description,
        completed: 'true'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data._id).toEqual(expect.anything())
        expect(res.body.data.title).toBe(validatedTitle)
        expect(res.body.data.description).toBe(validatedDescription)
        expect(res.body.data.removed).toBeFalsy()
        expect(res.body.data.completed).toBeTruthy()
      })
      .end((err) => {
        if (err) {
          return done(err)
        }

        Todo.findOne({title: validatedTitle}).then((todo) => {
          expect(todo).toEqual(expect.anything())
          expect(todo.title).toBe(validatedTitle)
          done()
        }).catch((e) => done(e))
      })
  }) //end should update, validate trim, and validate completed true

  it('should update unflag a removed todo', (done) => {
    request(app)
      .put(`/api/todo/${todos[2]._id}`)
      .set('Content-Type', 'application/json')
      .send({
        removed: 'false'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual(expect.anything())
        expect(res.body.data.removed).toBeFalsy()

        expect(res.body.status).toBe('ok')
      })
      .end((err) => {
        if (err) {
          return done(err)
        }

        //Verify value in DB
        Todo.findById(todos[2]._id).then((todo) => {
          expect(todo).toEqual(expect.anything())
          expect(todo.removed).toBeFalsy()

          done()
        }).catch((e) => done(e))
      })
  }) //end should update
})

describe('todo delete endpoint', () => {
  it('should delete a todo record frd', (done) => {
    request(app)
      .delete(`/api/todo/${todos[0]._id}?frd=true`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe(`Successfully removed todo ${todos[0]._id}`)
      })
      .end((err) => {
        if (err) {
          return done(err)
        }

        //Verify value in DB
        Todo.find().then((todos) => {
          expect(todos.length).toEqual(2)

          done()
        }).catch((e) => done(e))
      })
  }) //end should delete frd

  it('should flag a todo as removed', (done) => {
    request(app)
      .delete(`/api/todo/${todos[0]._id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual(expect.anything())
        expect(res.body.data.removed).toBeTruthy()

        expect(res.body.status).toBe('ok')
      })
      .end((err) => {
        if (err) {
          return done(err)
        }

        Todo.findById(todos[0]._id).then((todo) => {
          expect(todo).toEqual(expect.anything())
          expect(todo.removed).toBeTruthy()

          done()
        }).catch((e) => done(e))

      })
  }) //end should flag as removed

  it('should fail to delete due to bad object id', (done) => {
    request(app)
      .delete(`/api/todo/abc`)
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Invalid ID')
        expect(res.body.status).toBe('error')
      })
      .end(done)
  }) //end should fail due to bad object id

  it('should fail to delete due to no todo found', (done) => {
    var id = new ObjectID

    request(app)
      .delete(`/api/todo/${id}`)
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Todo not found')
        expect(res.body.status).toBe('error')
      })
      .end(done)
  }) //end should fail due to no todo found
})
