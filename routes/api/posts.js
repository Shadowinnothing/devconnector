const router = require('express').Router()
const mongoose = require('mongoose')
const passport = require('passport')

// Modals
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')

// Validation
const validatePostInput = require('../../validation/post')

// @route   GET /api/posts
// @desc    Get all Posts
// @access  Public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 }) // Return dates by most recent
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ noPosts : "No Posts found" }))
})

// @route   GET /api/posts/:postId
// @desc    Get single Post
// @access  Public
router.get('/:postId', (req, res) => {
    Post.findById(req.params.postId)
        .then(post => {res.json(post)})
        .catch(err => res.status(404).json({ noPost: "No Post found" }))
})

// @route   POST /api/posts
// @desc    Create Post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body)

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors)
    }

    const { text, name } = req.body
    const { avatar, id } = req.user
    const newPost = new Post({
        text,
        name,
        avatar,
        user: id
    })

    newPost.save()
        .then(post => res.json(post))
        .catch(err => res.json(err))
})

// @route   DELETE /api/posts/:postId
// @desc    Delete single Post
// @access  Private
router.delete('/:postId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.postId)
                .then(post => {
                    // Check if post belongs to user
                    if(post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notAuthorized: "User not authorized" })
                    }
                    Post.remove(post)
                        .then(() => { return res.json({ success: true }) })
                        .catch(err => res.status(404).json({ noPost: "Post not found" }))
                })
                .catch(err => res.json({post: "Post not found"}))
        })
})

// @route   POST /api/posts/like/:postId
// @desc    Like a post
// @access  Private
router.post('/like/:postId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(() => {
            Post.findById(req.params.postId)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({ alreadyLiked: "User has already liked this post" })
                    }

                    // Add user id to likes array
                    post.likes.unshift({ user: req.user.id })
                    post.save()
                        .then(post => (res.json(post)))
                })
                .catch(err => res.json({post: "Post not found"}))
        })
})

// @route   POST /api/posts/unlike/:postId
// @desc    Unlike a post
// @access  Private
router.post('/unlike/:postId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.postId)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({ notLiked: "User has not liked this post" })
                    }

                    // Get remove index
                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id)

                    // Remove user from array
                    post.likes.splice(removeIndex, 1)

                    post.save().then(post => (res.json(post)))
                })
                .catch(err => res.json({post: "Post not found"}))
        })
})

// @route   POST /api/posts/comment/:postId
// @desc    Comment on a post
// @access  Private
router.post('/comment/:postId', passport.authenticate('jwt', { session: false }), (req, res) => {
    
})

// @route   POST /api/posts/uncomment/:postId
// @desc    Uncomment a post
// @access  Private
router.post('/uncomment/:postId', passport.authenticate('jwt', { session: false }), (req, res) => {
    
})

module.exports = router;