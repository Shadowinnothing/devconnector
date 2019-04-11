const router = require('express').Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const jwtSecret = require('../../config/keys').secretOrKey

const User = require('../../models/User')

// Load input validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// @route   GET /api/users/test
// @desc    Test users route
// @access  Public
router.get('/test', (req, res) => { res.json({msg: "Users is working"}) })

// @route   POST /api/users/register
// @desc    Register a user
// @return  New User or Error
// @access  Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body)

    // Check Validation
    if(!isValid) {
        return res.status(400).json(errors)
    }

    // make sure email is unique
    User.findOne({ email: req.body.email })
        .then(user => {
            if(user) {
                errors.email = 'Email already exists in database'
                return res.status(400).json(errors)
            } else {
                if(!req.body.email){
                    console.log('shits fucked, there\'s is no email')
                }

                const avatar = gravatar.url(req.body.email, {
                    s: 200,         // Size
                    rating: 'rg',   // Rating
                    default: 'mm'   // default plain Facebook guy
                })

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err
                        newUser.password = hash
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err))
                    })
                })
            }
        })
        .catch(err => {
            console.log('[users.js] /register - Error finding user')
            res.json({ "error": "shits fucked"})
        })
})

// @route   GET /api/users/login
// @desc    Login a user
// @return  JWT - JSONWebToken
// @access  Public
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body)

    // Check Validation
    if(!isValid) {
        return res.status(400).json(errors)
    }

    const { email, password } = req.body
    
    User.findOne({ email })
        .then(user => {
            if(!user) {
                errors.email = 'user not found'
                return res.status(404).json(errors)
            }
            bcrypt.compare(password, user.password)
                .then(passwordsMatch => {
                    // User's password matches the database
                    if(passwordsMatch) {
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        }

                        // Sign tokenDelete auth_token after an hour
                        jwt.sign(payload, jwtSecret, { expiresIn: '2 hours' }, (err, token) => {
                            res.json({
                                login: "Login Successful!",
                                token: `Bearer ${token}`
                            })
                        })
                    } else {
                        errors.password = 'login failed'
                        return res.status(400).json(errors)
                    }
                })
                .catch(err => {
                    return res.send(err) 
                })
        })
})

// @route   GET /api/users/current
// @desc    Returns the current user
// @return  Return current user
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    const {id, name, email} = req.user
    res.json({
        id,
        name,
        email
    })
})

module.exports = router;