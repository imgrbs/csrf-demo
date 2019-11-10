require('dotenv').config()

const path = require('path')
const express = require('express')
const app = express()
const port = process.env.PORT || 80

const ADMIN_ACCOUNT = {
    username: 'admin',
    password: 'admin'
}

const STATIC_PATH = path.join(__dirname, 'public');

app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.cookie('SESSION', 'ABCDEFG')
    res.sendFile(`${STATIC_PATH}/index.html`)
})

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (
        (username && ADMIN_ACCOUNT.username == username) &&
        (password && ADMIN_ACCOUNT.password == password)
    ) {
        res.send({
            message: 'Success'
        })
    } else {
        res.send({
            message: 'Failed'
        })
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))