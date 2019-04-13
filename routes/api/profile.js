const router = require('express').Router()
const mongoose = require('mongoose') // why is this imported lol, i'm scared to delete it
const passport = require('passport')

// Load validation
const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')

// Load User and Profile Models
const User = require('../../models/User')
const Profile = require('../../models/Profile')

// @route   GET /api/profile/test
// @desc    Test profile route
// @access  Public
router.get('/test', (req, res) => { res.json({msg: "Profile is working"}) })

// @route   GET /api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', (req, res) => {
    const errors = {}

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if(!profiles) {
                errors.noProfile = 'No Profiles Found, lol this could be real bad, hopefully you never see this'
                return res.status(404).json(errors)
            }

            res.json(profiles)
        })
        .catch(err => res.status(412).json({ noProfile: 'No Profiles Found, more likely than not this is an error connecting to the db' }))
})

// @route   GET /api/profile/handle/:handle
// @desc    Get a user profile by their handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
    const errors = {}

    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noProfile = 'No Profile Found'
                return res.status(404).json(errors)
            }

            res.json(profile)
        })
        .catch(err => res.status(412).json({ noProfile: 'No Profile Found' }))
})

// @route   GET /api/profile/user/:userId
// @desc    Get a user profile by their userId
// @access  Public
router.get('/user/:userId', (req, res) => {
    const errors = {}

    Profile.findOne({ user: req.params.userId })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noProfile = 'No Profile Found'
                return res.status(404).json(errors)
            }

            res.json(profile)
        })
        .catch(err => res.status(412).json({ noProfile: 'No Profile Found' }))
})

// @route   GET /api/profile
// @desc    Get current User's profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}
    
    Profile.findOne({ user : req.user.id })
        .populate('user', ['name', 'avatar'])
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
    const { errors, isValid } = validateProfileInput(req.body)

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors)
    }

    // Get Fields
    // This doesn't fix all problems but whatever
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

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(profile){
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
                        .catch(err => res.status(412).json(err))
                    })
            }
        })
})

// @route   POST /api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body)

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors)
    }

    const { title, company, location, from, to, current, description } = req.body
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newExperience = {
                title,
                company,
                location,
                from,
                to,
                current,
                description
            }

            // Add to experience array for the given profile
            profile.experience.unshift(newExperience)
            profile.save()
                .then(profile => res.json(profile))
                .catch(err => res.status(412).json(err))
        })
        .catch(err => res.status(412).json(err))
})

// @route   POST /api/profile/education
// @desc    Add education to profile
// @access  Private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body)

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors)
    }

    const { school, degree, fieldOfStudy, from, to, current, description } = req.body
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newEducation = {
                school,
                degree,
                fieldOfStudy,
                from,
                to,
                current,
                description
            }

            // Add to education array for the given profile
            profile.education.unshift(newEducation)
            profile.save()
                .then(profile => res.json(profile))
                .catch(err => res.status(412).json(err))
        })
        .catch(err => res.status(412).json(err))
})

module.exports = router;