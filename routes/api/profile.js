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

// @route   POST /api/profile
// @desc    Create or edit User profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    // Get Fields
    const profileFields = {...req.body}

    //console.log( JSON.stringify(profileFields, undefined, 2) )

    const errors = {}

    // Required fields
    if(!profileFields.handle) errors.handle = 'Handle Required'
    if(!profileFields.status) errors.status = 'Status Required'
    if(!profileFields.skills) errors.skills = 'Skills Required'

    // Skills array
    if(typeof skills !== 'undefined') {
        profileFields.skills =  profileFields.skills.split(',')
    }

    // Social, weird because it's an object
    profileFields.social = {}
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram

    Profile.findOne({ user: req.user.id})
        .then(profile => {
            if(profile){
                // Update Profile
                Profile.findOneAndUpdate(
                    { user: req.user.id}, 
                    { $set: profileFields }, 
                    { new: true}
                )
                .then(profile => res.json(profile))
            } else {
                // Create Profile

                // Check if handle exists
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if(profile){
                            errors.handle = 'Handle already exists'
                        }

                        // if there's errors, throw errors with 412
                        if(Object.keys(errors).length) {
                            res.status(412).json(errors)
                        } else {
                            // Save Profile
                            new Profile(profileFields)
                            .save()
                            .then(profile => res.json(profile))
                            .catch(err => res.json(err))
                        }
                    })
            }
        })

    
})

module.exports = router;