const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const bodyParser = require('body-parser')
const date = require('date-and-time')

const posts = require('./routes/api/posts')
const profile = require('./routes/api/profile')
const users = require('./routes/api/users')

const app = express()

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Passport Middleware
app.use(passport.initialize())

// Passport Config
require('./config/passport')(passport) 

// db config
const db = require('./config/keys').mongoURI

// connect to mongodb
mongoose
    .connect(db)
    .then(() => console.log('[server.js] Connected to MongoDB'))
    .catch(err => console.log(`[server.js] Error connecting to MongoDB: ${err}`))

app.post('/', (req, res) => {
    res.status(200).json({ "msg": "Post Req" })
})

// use routes
app.use('/api/posts', posts)
app.use('/api/profile', profile)
app.use('/api/users', users)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`[${date.format(new Date(), 'hh:mm:ss')}] Server running on port: ${PORT}`)
})