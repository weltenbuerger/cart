const router = require('express').Router()
const { Cart } = require('../models/cart')

// axios
const axios = require('axios')

const PRODUCT_API_HEADER = {
  headers: {
    'Client-Id': process.env.PRODUCT_API_CLIENT_ID,
    'Client-Secret': process.env.PRODUCT_API_SECRET,
  },
}

// get product
router.get('/products/:id', (req, res, next) => {
  // console.log(req.params.id)
  const productId = req.params.id

  //   /products?id=33062
  axios
    .get('https://api.1213bst.net/products?id=' + productId, PRODUCT_API_HEADER)
    .then((response) => {
      const product = response.data.products[0]
      // console.log(product.id)
      res.render('product', { product: product })
    })
    .catch((err) => {
      next(err)
    })

  //   axios
  //     .get(
  //       'https://api.1213bst.net/products?page=1&per_page=5&sort=-created_at',
  //       PRODUCT_API_HEADER
  //     )
  //     .then((response) => {
  //       console.log(`products: ${response.data.products[0].title}`)
  //       const products = response.data.products
  //       res.render('index', { products: products })
  //     })
  //     .catch((err) => {
  //       console.log('error ' + error)
  //       next(err)
  //     })
})

// add to cart
router.get('/add-to-cart/:id', (req, res, next) => {
  // get productId and cart
  const productId = req.params.id
  const cart = new Cart(req.session.cart ? req.session.cart : {})
  //   get product via api
  axios
    .get('https://api.1213bst.net/products?id=' + productId, PRODUCT_API_HEADER)
    .then((response) => {
      const apiProduct = response.data.products[0]
      //   console.log({ apiProduct })
      cart.add(apiProduct, apiProduct.id)
      req.session.cart = cart
      console.log(req.session.cart)
      res.redirect('/cart')
    })
    .catch((err) => {
      next(err)
    })
})

// subtract from cart
router.get('/subtract/:id', (req, res, next) => {
  // get productId and cart
  const productId = req.params.id
  const cart = new Cart(req.session.cart ? req.session.cart : {})

  cart.subtract(productId)
  req.session.cart = cart
  res.redirect('/cart')
})

// remove from cart
router.get('/remove/:id', (req, res, next) => {
  // get productId and cart
  const productId = req.params.id
  const cart = new Cart(req.session.cart ? req.session.cart : {})

  cart.remove(productId)
  req.session.cart = cart
  res.redirect('/cart')
})

// cart
router.get('/cart', (req, res, next) => {
  if (!req.session.cart) {
    return res.render('cart', { products: null })
  }
  const cart = new Cart(req.session.cart)
  res.render('cart', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    totalQty: cart.totalQty,
  })
})

module.exports = router
