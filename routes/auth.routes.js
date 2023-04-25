const express = require('express')
const User = require('../models/User.model')
const router = express.Router()
const bcryptjs = require('bcryptjs')

const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/

/* GET to display a signup form */
router.get('/signup', (req, res, next) => {
  res.render('auth/signup')
})
/* POST to work with the values of the signup form */
router.post('/signup', async (req, res, next) => {
  try {
    const potentialUser = await User.findOne({ username: req.body.username })
    if (!potentialUser) {
      if (pwdRegex.test(req.body.password)) {
        const salt = bcryptjs.genSaltSync(13)

        const passwordHash = bcryptjs.hashSync(req.body.password, salt)

        await User.create({ username: req.body.username, passwordHash })
        res.redirect('/auth/login')
      } else {
        res.render('auth/signup', {
          errorMessage: 'Password is not strong enough',
          data: { username: req.body.username },
        })
      }
    } else {
      res.render('auth/signup', {
        errorMessage: 'Username already in use',
        data: { username: req.body.username },
      })
    }
  } catch (error) {
    console.log(error)
  }
})
/* GET to display a login form */
router.get('/login', (req, res, next) => {
  res.render('auth/login')
})
/* POST to work with the values of theB login form */
router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username })
    console.log(user)
    if (!!user) {
      /* Trying to check if user is not not false
    user = null
    !user => true
    !true => false
    !!user => false */
      if (bcryptjs.compareSync(req.body.password, user.passwordHash)) {
        // If password is correct
        req.session.user = { username: user.username }
        res.redirect('/profile')
      } else {
        // If password is wrong
        res.render('auth/login', { errorMessage: 'Wrong password' })
      }
    } else {
      // If we don't have a user with the given username
      res.render('auth/login', { errorMessage: 'User does not exists' })
    }
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
