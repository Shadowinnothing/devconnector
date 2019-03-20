const express = require('express')
const mongoose = require('mongoose')

const app = express()

// db config
const db = require('./config/keys').mongoURI

// connect to mongodb
mongoose
    .connect(db)
    .then(() => console.log('[server.js] Connected to MongoDB'))
    .catch(err => console.log('[server.js] Error connecting to MongoDB: ' + err))

app.get('/', (req, res) => {
    console.log(req.route)
    res.send('Hello World!')
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`[server.js] Server running on port: ${PORT}`)
})