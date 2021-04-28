// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv/config')

// ℹ️ Connects to the database
require('./db')

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express')

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require('hbs')

const app = express()

app.use(express.static('public/images'))

// app.use(express.bodyParser())

// Session Configuration
const session = require('express-session')
const MongoStore = require('connect-mongo')
const mongoose = require('./db/index')
const DB_URL = 'mongodb://localhost/passport'

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    saveUninitialized: false,
    resave: true,
    store: MongoStore.create({
      mongoUrl: DB_URL,
    }),
  })
)

// end of session configuration

// cart session
app.use((req, res, next) => {
  // res.locals.login = req.isAuthenticated(); // <- use this to check if user ist logged in or not
  res.locals.session = req.session
  next()
})
// end of cart session

// passport configuration
const User = require('./models/User.model')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')

// this method is used by passport to put the id of the user into the session
passport.serializeUser((user, done) => {
  done(null, user._id)
})

// this method is used to retrieve the user by it's id ( which is stored in the session)
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((dbUser) => {
      done(null, dbUser)
    })
    .catch((err) => {
      done(err)
    })
})

passport.use(
  new LocalStrategy(
    // By default, LocalStrategy expects to find credentials in parameters named username and password.
    // change parameters
    {
      usernameField: 'email',
    },

    (username, password, done) => {
      // console.log({ username })
      // attention emai: username
      User.findOne({ email: username })
        .then((dbUser) => {
          // console.log({ dbUser })
          if (dbUser === null) {
            // there is no user with this email
            done(null, false, { message: 'Wrong Credentials' })
          } else if (!bcrypt.compareSync(password, dbUser.passwordHash)) {
            // the password does not match
            console.log('password does not match')
            done(null, false, { message: 'Wrong Credentials' })
          } else {
            // everyhting correct - user should be logged in
            console.log('everything correct - user should be logged in')
            done(null, dbUser)
          }
        })
        .catch((err) => next(err))
    }
  )
)

app.use(passport.initialize())
app.use(passport.session())

// end of passport configuration

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require('./config')(app)

// default value for title local
const projectName = 'cart'
const capitalized = (string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase()

// locals are accessible accross the app
app.locals.title = `1213bst`

// 👇 Start handling routes here
const index = require('./routes/index')
app.use('/', index)

// registration, authentication, login ... all things auth
const auth = require('./routes/auth')
app.use('/', auth)

// handles products and cart
const products = require('./routes/products')
const { response } = require('express')
app.use('/', products)

const checkout = require('./routes/checkout')
app.use('/', checkout)

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app)

module.exports = app
