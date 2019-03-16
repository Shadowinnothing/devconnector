const express = require('express')

const app = express()

app.get('/', (req, res) => {
    console.log(req.route)
    res.send('Hello World!')
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})