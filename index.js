require('dotenv').config()

const path = require('path')
const express = require('express')
const jwt = require('jsonwebtoken');
const AES = require("crypto-js/aes");
const cookieParser = require('cookie-parser')

const PORT = process.env.PORT || 80
const KEY = process.env.KEY || 'djweedisthebest'

const STATIC_PATH = path.join(__dirname, 'public');

const SESSIONS = [];
const CSRF_TOKENS = [];
const USERS = [];

const app = express()

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

const initUsers = () => {
    const SENDER_ACCOUNT = {
        username: 'pupu',
        password: '1234',
        amount: 1000,
    }

    const RECEIVEER_ACCOUNT = {
        username: 'volk',
        password: '1234',
        amount: 0,
    }

    USERS.push(SENDER_ACCOUNT);
    USERS.push(RECEIVEER_ACCOUNT);
}

initUsers();

function isValidUser(user) {
    const sessionIndex = USERS.findIndex(({ username, password }) => {
        return username === user.username && password === user.password
    })
    return sessionIndex !== -1
}

function findSessionIndex(token) {
    const sessionIndex = SESSIONS.findIndex(sessions => sessions === token)
    return sessionIndex
}

function isValidSession(sessionIndex) {
    return sessionIndex !== -1
}

function createSession(res, username) {
    const token = jwt.sign({ username }, KEY)
    SESSIONS.push(token);
    res.cookie('SESSION', token)
}

function isValidToken(token) {
    const tokenIndex = CSRF_TOKENS.findIndex(csrfToken => csrfToken === token)
    return tokenIndex !== -1
}

function createCsrfToken(username) {
    const token = AES.encrypt(username, KEY);
    CSRF_TOKENS.push(token.toString());
    return token;
}

function transfer(sender, receiver, amount) {
    
}

app.get('/', (req, res) => {
    const { SESSION } = req.cookies

    if (SESSION) {
        const sessionIndex = findSessionIndex(SESSION)
        if (isValidSession(sessionIndex)) {
            const sender = USERS[sessionIndex].username

            const options = {
                token: createCsrfToken(sender).toString()
            }

            return res.render(`${STATIC_PATH}/index.pug`, options)
        }
    }

    return res.redirect('/login?error=true')
})

app.post('/transfer', (req, res) => {
    const { receiver, amount, token } = req.body
    const { SESSION } = req.cookies

   if (SESSION && isValidToken(token)) {

       const sessionIndex = findSessionIndex(SESSION)

        if (isValidSession(sessionIndex)) {

            const sender = USERS[sessionIndex].username

            transfer(sender, receiver, amount)

            return res.sendFile(`${STATIC_PATH}/success.html`);
        }
    }

    return res.redirect('/login?error=true')
})


app.get('/login', (req, res) => {
    const options = {
        error: req.query.error
    }
    res.render(`${STATIC_PATH}/login.pug`, options);
})

app.post('/login', (req, res) => {
    const { username, password } = req.body

    if (username && password && isValidUser({ username, password })) {

        createSession(res, username);

        return res.redirect('/')
    }

    return res.redirect('/login?error=true')
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))