const router = require('express').Router()
const mongoose = require('mongoose')
const passport = require('passport')

// Load User and Profile Models
const User = require('../../models/User')
const Profile = require('../../models/Profile')

// @route   GET /api/profile/test
// @desc    Test profile route
// @access  Public
router.get('/test', (req, res) => { res.json({msg: "Profile is working"}) })

// @route   GET /api/profile
// @desc    Get current User's profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const errors = {}

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile) {
                errors.noProfile = 'No profile for this user found'
                return res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json(err))
})

module.exports = router;