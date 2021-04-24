const router = require('express').Router()

// const loginCheck = () => {
//   return (req, res, next) => {
//     // check if the user is logged in
//     if (req.isAuthenticated()) {
//       next()
//     } else {
//       res.redirect('/login')
//     }
//   }
// }

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index')
})

module.exports = router
