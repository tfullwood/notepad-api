const { Error } = require('../models/errors')

function errMiddleware(err, req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    //2 differences between prod and test/beta
      //not console logging the errors in production
      //not sending the stack production json response
    var status = err.status || 500

    //Setup and send error to db log
    var data = {
      message: err.message || 'Something went wrong and the error isn\'t being handled well.',
      stack: err.stack || 'Missing stack',
      environment: process.env.NODE_ENV,
      statusCode: status
    }

    var error = new Error(data)

    error.save().then((doc) => {
      return res.status(status).json({
        message: err.message,
        status: 'error'
      })
    }, (e) => {
      return res.status(status).json({
        message: err.message,
        status: 'error',
        log: 'Failed to log error. Please contact us to resolve error.'
      })
    })
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('Something wen\'t wrong \n');
      console.log(err)
    }

    var status = err.status || 500

    //Setup and send error to db log
    var data = {
      message: err.message || 'Something went wrong and the error isn\'t being handled well.',
      stack: JSON.stringify(err.stack) || 'Missing stack',
      environment: process.env.NODE_ENV,
      statusCode: Number(status)
    }

    var error = new Error(data)

    error.save().then((doc) => {
      return res.status(status).json({
        message: err.message,
        status: 'error',
        error: err.stack
      })
    }, (e) => {
      return res.status(status).json({
        message: err.message,
        status: 'error',
        error: err.stack,
        log: 'Failed to log error. Please contact us to resolve error.'
      })
    })
  }
}

module.exports = errMiddleware


//Old Process
//Used to have this in the root index.js file
  //refactored and created the middleware dir

// //Setup the error handling
// if (process.env.NODE_ENV === 'production') {
//   app.use(function(err, req, res, next) {
//     //2 differences between prod and test/beta
//       //not console logging the errors in production
//       //not sending the stack production json response
//     var status = err.status || 500
//
//     //Setup and send error to db log
//     var data = {
//       message: err.message || 'Something went wrong and the error isn\'t being handled well.',
//       stack: err.stack || 'Missing stack',
//       environment: process.env.NODE_ENV,
//       statusCode: status
//     }
//
//     var error = new Error(data)
//
//     error.save().then((doc) => {
//       return res.status(status).json({
//         message: err.message,
//         status: 'error'
//       })
//     }, (e) => {
//       return res.status(status).json({
//         message: err.message,
//         status: 'error',
//         log: 'Failed to log error. Please contact us to resolve error.'
//       })
//     })
//   })
// } else {
//   app.use(function(err, req, res, next) {
//     console.log('Something wen\'t wrong \n');
//     console.log(err)
//
//     var status = err.status || 500
//
//     //Setup and send error to db log
//     var data = {
//       message: err.message || 'Something went wrong and the error isn\'t being handled well.',
//       stack: JSON.stringify(err.stack) || 'Missing stack',
//       environment: process.env.NODE_ENV,
//       statusCode: Number(status)
//     }
//
//     var error = new Error(data)
//
//     error.save().then((doc) => {
//       return res.status(status).json({
//         message: err.message,
//         status: 'error',
//         error: err.stack
//       })
//     }, (e) => {
//       return res.status(status).json({
//         message: err.message,
//         status: 'error',
//         error: err.stack,
//         log: 'Failed to log error. Please contact us to resolve error.'
//       })
//     })
//   })
// }
