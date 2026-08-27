const express = require('express');
const authMiddleware = require('../../middlewares/auth');
const { postCategory, getCategories, deleteCategoryHandler } = require('./category.controller');

const router = express.Router();
router.post('/', authMiddleware, postCategory);
router.get('/', authMiddleware, getCategories);
router.delete('/:id', authMiddleware, deleteCategoryHandler);

module.exports = router;
