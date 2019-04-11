const router = require('express').Router()
const mongoose = require('mongoose')
const passport = require('passport')

// Load validation
const validateProfileInput = require('../../validation/profile')

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
    console.log(req.user.id)
    Profile.findOne({ user : req.user.id })
        .then(profile => {
            console.log(profile)
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
    const { errors, isValid } = validateProfileInput(req.body)

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors)
    }

    // Get Fields
    const profileFields = {...req.body}
    profileFields.id = null

    // Link the UserId to the profile or else
    // the DB won't find a profile for a given
    // user. Took WAY too long 
    profileFields.user = req.user.id

    // Skills array
    profileFields.skills =  profileFields.skills.split(',')

    // Social, weird because it's an object
    profileFields.social = {}
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram

    // Education the same way
    profileFields.education = {}
    if(req.body.school) profileFields.education.school = req.body.school

    // Experience, same
    profileFields.experience = {}
    if(req.body.title) profileFields.experience.title = req.body.title
    if(req.body.company) profileFields.experience.company = req.body.company
    if(req.body.location) profileFields.experience.location = req.body.location
    if(req.body.experienceFrom) profileFields.experience.from = req.body.from
    if(req.body.to) profileFields.experience.to = req.body.to
    if(req.body.current) profileFields.experience.current = req.body.current
    if(req.body.description) profileFields.experience.description = req.body.description

    console.log(req.user)

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(profile){
                console.log('made it')
                // Update Profile
                Profile.findOneAndUpdate(
                    { user: req.user.id }, 
                    { $set: profileFields }, 
                    { new: true }
                )
                .then(prof => res.json(prof))
            } else {
                // Create Profile
                
                // Check if handle exists
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if(profile){
                            errors.handle = 'Handle already exists'
                            return res.status(400).json(errors)
                        }

                        // Save Profile
                        new Profile(profileFields)
                        .save()
                        .then(profile => res.json(profile))
                        .catch(err => res.json(err))
                    })
            }
        })
})

module.exports = router;