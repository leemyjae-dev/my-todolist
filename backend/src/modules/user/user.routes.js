const express = require('express');
const authMiddleware = require('../../middlewares/auth');
const { getMeHandler, patchMeHandler } = require('./user.controller');

const router = express.Router();
router.get('/me', authMiddleware, getMeHandler);
router.patch('/me', authMiddleware, patchMeHandler);

module.exports = router;
