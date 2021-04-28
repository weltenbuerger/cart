const router = require('express').Router()
const { session } = require('passport')
const { Cart } = require('../models/cart')
const User = require('../models/User.model.js')
const { UserSession } = require('../models/userSession')
const passport = require('passport')
const Order = require('../models/Order.model.js')

router.get('/checkout', (req, res, next) => {
  // add {layout: false} to the object if you don't want to use the layout file for this route

  // this checks if customer is logged in or not
  if (req.isAuthenticated()) {
    //   save userSession with email
    const userSession = new UserSession(
      req.session.userSession ? req.session.userSession : {}
    )
    console.log(req.user.email)

    userSession.email = req.user.email
    console.log({ userSession })
    req.session.userSession = userSession
    res.render('address', { userSession: userSession })
  } else {
    res.render('checkout')
  }
})

// save email in cart and continue to address
router.post('/address', (req, res, next) => {
  const { email } = req.body

  // check if all fields are filled
  if (!email) {
    res.render('checkout', {
      guestErrorMessage: '• Please provide your email.',
    })
    return
  }
  // validate that email
  const validEmail = (function (email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  })(email)

  if (!validEmail) {
    res.render('checkout', {
      guestErrorMessage: '• Please provide a valid email address.',
    })
    return
  }

  User.findOne({ email })
    .then((emailFromDB) => {
      if (emailFromDB !== null) {
        res.render('checkout', {
          guestErrorMessage:
            '• Email already exists please choose a different email.',
        })
        return
      }
      //   save userSession with email
      const userSession = new UserSession(
        req.session.userSession ? req.session.userSession : {}
      )

      userSession.email = email
      req.session.userSession = userSession
      res.render('address', { userSession: userSession })
    })
    .catch((err) => next(err))
})

// registered customer login and go to address
router.post('/login-address', function (req, res, next) {
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

      //   save userSession with email
      const userSession = new UserSession(
        req.session.userSession ? req.session.userSession : {}
      )

      userSession.email = req.user.email
      req.session.userSession = userSession
      res.render('address', { userSession: userSession })
    })
  })(req, res, next)
})

// post address and move to payment
router.post('/payment', (req, res, next) => {
  //   save userSession with email
  const userSession = new UserSession(
    req.session.userSession ? req.session.userSession : {}
  )

  userSession.email = req.body.email
  userSession.country = req.body.country
  userSession.firstName = req.body.firstName
  userSession.lastName = req.body.lastName
  userSession.company = req.body.company
  userSession.street = req.body.street
  userSession.apt = req.body.apt
  userSession.postalcode = req.body.postalcode
  userSession.check_sign_in = req.body.check_sign_in
  userSession.phone = req.body.phone

  req.session.userSession = userSession
  // only cart information is needed - therefore pass cart not userSession
  if (!req.session.cart) {
    return res.render('payment', { products: null })
  }
  const cart = new Cart(req.session.cart)
  req.session.cart = cart
  res.render('payment', {
    cart: cart,
  })
})

router.post('/review', (req, res, next) => {
  // --> payment method logic will go here

  res.render('review')
})

router.post('/order-create', (req, res, next) => {
  // check if customer is logged in
  if (req.user === undefined) {
    console.log('no user id customer is not registered')
    res.redirect('/account')
  } else {
    const { _id } = req.user
    const user = req.session.userSession

    // find user and update with shipping information
    User.findByIdAndUpdate(
      _id,
      {
        $set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          street: user.street,
          apt: user.apt,
          postalcode: user.postalcode,
          phone: user.phone,
          country: user.country,
        },
      },
      { new: true },
      (err, doc, res) => {
        if (err) {
          console.log('could not findByIdAndUpdate: ', err)
        }
        if (doc) {
          console.log(doc)
        }
      }
    )

    const {
      items,
      totalQty,
      subtotalPrice,
      shippingPrice,
      discount,
      totalPrice,
      tradeCredit,
      finalPrice,
    } = req.session.cart

    Order.create({
      orderStatus: 'ordered',
      paymentStatus: 'pending',
      customer: _id,
      items: items,
      totalQty: totalQty,
      subtotalPrice: subtotalPrice,
      discount: discount,
      totalPrice: totalPrice,
      tradeCredit: tradeCredit,
      finalPrice: finalPrice,
      shippingOption: 'free',
      shippingPrice: shippingPrice,
      paymentOption: 'paypal',
    })
      .then((dbOrder) => {
        return User.findByIdAndUpdate(_id, {
          $push: { orders: dbOrder._id },
        })
      })
      .then((dbOrder) => {
        console.log(dbOrder)
        res.render('order', { order: dbOrder })
      })
      .catch((err) =>
        console.log(`Err while creating the order in the DB: ${err}`)
      )
  }
})

module.exports = router

// check if customer is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

// check if customer is not logged in
function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}
