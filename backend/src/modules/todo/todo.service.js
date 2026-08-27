const { findCategoryById, findDefaultCategoryByUserId } = require('../../db/queries/category.queries');
const {
  createTodo: createTodoQuery,
  findTodoById,
  findTodosByUserId,
  updateTodo: updateTodoQuery,
  deleteTodoById,
} = require('../../db/queries/todo.queries');
const { computeStatus } = require('../../shared/todoStatus');
const notFoundIfEmpty = require('../../shared/notFoundIfEmpty');

function withStatus(todo) {
  return { ...todo, status: computeStatus(todo) };
}

// BR-03, BR-04, BR-05
async function createTodo(userId, { categoryId, title, description, startDate, endDate }) {
  let resolvedCategoryId = categoryId;
  if (resolvedCategoryId) {
    notFoundIfEmpty(await findCategoryById(resolvedCategoryId, userId), '카테고리를 찾을 수 없습니다.'); // BR-05
  } else {
    const defaultCategory = await findDefaultCategoryByUserId(userId); // BR-03
    resolvedCategoryId = defaultCategory.id;
  }
  const todo = await createTodoQuery(userId, { categoryId: resolvedCategoryId, title, description, startDate, endDate });
  console.log('[todo] created', todo.id, userId);
  return withStatus(todo);
}

async function listTodos(userId, { categoryId, status, page = 1, limit = 20 } = {}) {
  const todos = await findTodosByUserId(userId, { categoryId });
  const withStatuses = todos.map(withStatus);
  const filtered = status ? withStatuses.filter((t) => t.status === status) : withStatuses;
  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);
  return { items, page, limit, total };
}

// BR-04, BR-05
async function updateTodo(userId, todoId, fields) {
  const existing = notFoundIfEmpty(await findTodoById(todoId, userId), '할일을 찾을 수 없습니다.'); // BR-05

  if (fields.categoryId) {
    notFoundIfEmpty(await findCategoryById(fields.categoryId, userId), '카테고리를 찾을 수 없습니다.'); // BR-05
  }

  const nextStartDate = fields.startDate ?? existing.startDate;
  const nextEndDate = fields.endDate ?? existing.endDate;
  if (nextStartDate > nextEndDate) { // BR-04
    const err = new Error('시작일은 종료일보다 늦을 수 없습니다.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  let completedAt = existing.completedAt;
  if (fields.isCompleted === true && !existing.isCompleted) {
    completedAt = new Date();
  } else if (fields.isCompleted === false) {
    completedAt = null;
  }

  const updated = await updateTodoQuery(todoId, { ...fields, completedAt });
  console.log('[todo] updated', todoId, userId);
  return withStatus(updated);
}

async function deleteTodo(userId, todoId) {
  notFoundIfEmpty(await findTodoById(todoId, userId), '할일을 찾을 수 없습니다.'); // BR-05
  await deleteTodoById(todoId);
  console.log('[todo] deleted', todoId, userId);
}

module.exports = { createTodo, listTodos, updateTodo, deleteTodo };
