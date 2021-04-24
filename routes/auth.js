const router = require('express').Router()
const bcrypt = require('bcrypt')
const passport = require('passport')

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

// User Model
const User = require('../models/User.model.js')

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
    res.render('account', {
      errorMessage:
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
    res.render('account', {
      errorMessage: '• Please provide a valid email address.',
    })
    return
  }
  console.log({ email })
  User.findOne({ email })
    .then((emailFromDB) => {
      console.log({ emailFromDB })
      if (emailFromDB !== null) {
        res.render('account', {
          errorMessage:
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
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/account',
    failureRedirect: '/login',
    passReqToCallback: true,
  })
  // (req, res) => {
  //   console.log('passport user', req.user)
  // }
)

// // USE THIS FOR LOGGING ERRORS
// router.post(
//   '/login',
//   // wrap passport.authenticate call in a middleware function
//   function (req, res, next) {
//     // call passport authentication passing the "local" strategy name and a callback function
//     passport.authenticate('local', function (error, user, info) {
//       // this will execute in any case, even if a passport strategy will find an error
//       // log everything to console
//       console.log({ error })
//       console.log({ user })
//       console.log({ info })

//       if (error) {
//         res.status(401).send(error)
//       } else if (!user) {
//         res.status(401).send(info)
//       } else {
//         next()
//       }

//       res.status(401).send(info)
//     })(req, res)
//   },

//   // function to call once successfully authenticated
//   function (req, res) {
//     console.log(req.user)
//     res.status(200).send('logged in!')
//   }
// )

/*
function (req, res, next) {
    // call passport authentication passing the "local" strategy name and a callback function
    passport.authenticate('local', function (error, user, info) {
      // this will execute in any case, even if a passport strategy will find an error
      // log everything to console
      console.log(error);
      console.log(user);
      console.log(info);

      if (error) {
        res.status(401).send(error);
      } else if (!user) {
        res.status(401).send(info);
      } else {
        next();
      }

      res.status(401).send(info);
    })(req, res);
  },

  // function to call once successfully authenticated
  function (req, res) {
    res.status(200).send('logged in!');
  });
*/

router.get('/logout', (req, res, next) => {
  // this is a passport function
  req.logout()
  res.redirect('/')
})

module.exports = router