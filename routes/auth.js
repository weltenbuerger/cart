const router = require('express').Router()
const bcrypt = require('bcrypt')
const passport = require('passport')

// User Model
const User = require('../models/User.model.js')

// this can be refactored - > either removed and placed inside route or placed into its own file
const loginCheck = () => {
  return (req, res, next) => {
    // check if the user is logged in
    if (req.isAuthenticated()) {
      next()
    } else {
      res.redirect('/register')
    }
  }
}

// both routes should go the login view
router.get('/register', (req, res, next) => {
  res.render('login')
})
router.get('/login', (req, res, next) => {
  res.render('login')
})

//  customer account
router.get('/account', loginCheck(), (req, res, next) => {
  // this is the passport way of accessing the logged in user
  const currentUser = req.user
  console.log(req.user)

  res.render('account', { currentUser: currentUser })
})

// register new customer
const bcryptSalt = 10

router.post('/register', (req, res, next) => {
  console.log(req.body)
  // add {layout: false} to the object if you don't want to use the layout file for this route
  const { email, password, confirmPassword } = req.body

  // check if all fields are filled
  if (!email || !password || !confirmPassword) {
    res.render('login', {
      registrationErrorMessage:
        '• All fields are mandatory. Please provide your email, password and confirm your password.',
    })
    return
  }
  // validate that email
  const validEmail = (function (email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  })(email)

  if (!validEmail) {
    res.render('login', {
      registrationErrorMessage: '• Please provide a valid email address.',
    })
    return
  }
  console.log({ email })
  User.findOne({ email })
    .then((emailFromDB) => {
      console.log({ emailFromDB })
      if (emailFromDB !== null) {
        res.render('login', {
          registrationErrorMessage:
            '• Email already exists please choose a different email.',
        })
        return
      }
      // encrypt password
      const salt = bcrypt.genSaltSync(bcryptSalt)
      const hashPass = bcrypt.hashSync(password, salt)

      console.log({ email })
      // save user in db
      const newUser = new User({
        email: email,
        passwordHash: hashPass,
      })

      newUser
        .save()
        .then(() => {
          res.redirect('/')
        })
        .catch((err) => next(err))
    })
    .catch((err) => next(err))
})

// login with passport
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.render('login', { loginErrorMessage: info.message })
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err)
      }
      return res.redirect('/account')
    })
  })(req, res, next)
})

router.get('/logout', (req, res, next) => {
  // this is a passport function
  req.logout()
  res.redirect('/login')
})

module.exports = router
