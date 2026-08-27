const express = require('express');
const { postSignup, postLogin, postTokenRefresh } = require('./auth.controller');

const router = express.Router();
router.post('/signup', postSignup);
router.post('/login', postLogin);
router.post('/token/refresh', postTokenRefresh);

module.exports = router;
