const express = require('express');
const authMiddleware = require('../../middlewares/auth');
const { postTodo, getTodos, patchTodo, deleteTodoHandler } = require('./todo.controller');

const router = express.Router();
router.post('/', authMiddleware, postTodo);
router.get('/', authMiddleware, getTodos);
router.patch('/:id', authMiddleware, patchTodo);
router.delete('/:id', authMiddleware, deleteTodoHandler);

module.exports = router;
