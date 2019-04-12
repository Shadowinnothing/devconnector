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

    // Education the same way
    profileFields.education = {}
    if(req.body.currentEducation) profileFields.education.current = req.body.currentEducation
    if(req.body.degree) profileFields.education.degree = req.body.degree
    if(req.body.educationDescription) profileFields.education.description = req.body.educationDescription
    if(req.body.educationFrom) profileFields.education.from = req.body.educationFrom
    if(req.body.educationTo) profileFields.education.to = req.body.educationTo
    if(req.body.school) profileFields.education.school = req.body.school

    // Experience, same
    profileFields.experience = {}
    if(req.body.company) profileFields.experience.company = req.body.company
    if(req.body.currentExperience) profileFields.experience.current = req.body.currentExperience
    if(req.body.experienceDescription) profileFields.experience.description = req.body.experienceDescription
    if(req.body.experienceFrom) profileFields.experience.from = req.body.experienceFrom
    if(req.body.experienceTo) profileFields.experience.to = req.body.experienceTo
    if(req.body.location) profileFields.experience.location = req.body.location
    if(req.body.title) profileFields.experience.title = req.body.title

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
                        .catch(err => res.json(err))
                    })
            }
        })
})

module.exports = router;