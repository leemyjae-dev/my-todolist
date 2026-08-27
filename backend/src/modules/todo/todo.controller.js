const { createTodo, listTodos, updateTodo, deleteTodo } = require('./todo.service');

const STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'OVERDUE', 'COMPLETED'];

function validationError(message) {
  const err = new Error(message);
  err.status = 400;
  err.code = 'VALIDATION_ERROR';
  return err;
}

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

function validateDates(startDate, endDate) {
  if (startDate && endDate && startDate > endDate) {
    throw validationError('시작일은 종료일보다 늦을 수 없습니다.');
  }
}

const postTodo = asyncHandler(async (req, res) => {
  const { title, description, categoryId, startDate, endDate } = req.body || {};
  if (!title || title.length < 1 || title.length > 200) throw validationError('제목은 1~200자여야 합니다.');
  if (!startDate || !endDate) throw validationError('시작일과 종료일은 필수입니다.');
  validateDates(startDate, endDate);
  const todo = await createTodo(req.user.id, { categoryId, title, description, startDate, endDate });
  res.status(201).json(todo);
});

const getTodos = asyncHandler(async (req, res) => {
  const { categoryId, status, page, limit } = req.query;
  if (status && !STATUSES.includes(status)) throw validationError('올바르지 않은 status 값입니다.');
  const result = await listTodos(req.user.id, {
    categoryId,
    status,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });
  res.status(200).json(result);
});

const patchTodo = asyncHandler(async (req, res) => {
  const { title, description, categoryId, startDate, endDate, isCompleted } = req.body || {};
  if (title !== undefined && (title.length < 1 || title.length > 200)) throw validationError('제목은 1~200자여야 합니다.');
  validateDates(startDate, endDate);
  const todo = await updateTodo(req.user.id, req.params.id, { title, description, categoryId, startDate, endDate, isCompleted });
  res.status(200).json(todo);
});

const deleteTodoHandler = asyncHandler(async (req, res) => {
  await deleteTodo(req.user.id, req.params.id);
  res.status(204).send();
});

module.exports = { postTodo, getTodos, patchTodo, deleteTodoHandler };
