const router = require('express').Router()
const axios = require('axios')

const PRODUCT_API_HEADER = {
  headers: {
    'Client-Id': process.env.PRODUCT_API_CLIENT_ID,
    'Client-Secret': process.env.PRODUCT_API_SECRET,
  },
}

/* GET home page */
router.get('/', (req, res, next) => {
  axios
    .get(
      'https://api.1213bst.net/products?page=1&per_page=50&sort=-created_at',
      PRODUCT_API_HEADER
    )
    .then((response) => {
      console.log(`products: ${response.data.products[0].title}`)
      const products = response.data.products
      res.render('index', { products: products })
    })
    .catch((err) => {
      console.log('error ' + error)
      next(err)
    })
})

module.exports = router
