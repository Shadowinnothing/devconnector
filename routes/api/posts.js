const router = require('express').Router()
const mongoose = require('mongoose')
const passport = require('passport')

// Post Modal
const Post = require('../../models/Post')

// Validation
const validatePostInput = require('../../validation/post')

// @route   POST /api/posts
// @desc    Create Post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body)

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors)
    }

    const { text, name, avatar, user } = req.body
    const newPost = new Post({
        text,
        name,
        avatar,
        user
    })

    newPost
        .save()
        .then(post => res.json(post))
        .catch(err => res.json(err))
})

module.exports = router;