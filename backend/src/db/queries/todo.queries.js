const pool = require('../pool');

// BR-08: 카테고리 삭제 시 소속 Todo를 다른 카테고리로 이동
async function moveCategoryTodos(fromCategoryId, toCategoryId, client = pool) {
  const { rowCount } = await client.query(
    `UPDATE todos SET category_id = $2 WHERE category_id = $1`,
    [fromCategoryId, toCategoryId]
  );
  return rowCount;
}

async function createTodo(userId, { categoryId, title, description, startDate, endDate }) {
  const { rows } = await pool.query(
    `INSERT INTO todos(user_id, category_id, title, description, start_date, end_date)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, category_id AS "categoryId", title, description,
       start_date::text AS "startDate", end_date::text AS "endDate",
       is_completed AS "isCompleted", completed_at AS "completedAt",
       created_at AS "createdAt", updated_at AS "updatedAt"`,
    [userId, categoryId, title, description || null, startDate, endDate]
  );
  return rows[0];
}

// BR-05: 소유권 겸용 조회
async function findTodoById(id, userId) {
  const { rows } = await pool.query(
    `SELECT id, category_id AS "categoryId", title, description,
       start_date::text AS "startDate", end_date::text AS "endDate",
       is_completed AS "isCompleted", completed_at AS "completedAt",
       created_at AS "createdAt", updated_at AS "updatedAt"
     FROM todos WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rows[0] || null;
}

async function findTodosByUserId(userId, { categoryId } = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  if (categoryId) {
    params.push(categoryId);
    conditions.push(`category_id = $${params.length}`);
  }
  const { rows } = await pool.query(
    `SELECT id, category_id AS "categoryId", title, description,
       start_date::text AS "startDate", end_date::text AS "endDate",
       is_completed AS "isCompleted", completed_at AS "completedAt",
       created_at AS "createdAt", updated_at AS "updatedAt"
     FROM todos WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
  return rows;
}

async function updateTodo(id, { categoryId, title, description, startDate, endDate, isCompleted, completedAt }) {
  const { rows } = await pool.query(
    `UPDATE todos SET
       category_id = COALESCE($2, category_id),
       title = COALESCE($3, title),
       description = COALESCE($4, description),
       start_date = COALESCE($5, start_date),
       end_date = COALESCE($6, end_date),
       is_completed = COALESCE($7, is_completed),
       completed_at = $8,
       updated_at = now()
     WHERE id = $1
     RETURNING id, category_id AS "categoryId", title, description,
       start_date::text AS "startDate", end_date::text AS "endDate",
       is_completed AS "isCompleted", completed_at AS "completedAt",
       created_at AS "createdAt", updated_at AS "updatedAt"`,
    [id, categoryId ?? null, title ?? null, description ?? null, startDate ?? null, endDate ?? null, isCompleted ?? null, completedAt]
  );
  return rows[0];
}

async function deleteTodoById(id) {
  await pool.query(`DELETE FROM todos WHERE id = $1`, [id]);
}

module.exports = { moveCategoryTodos, createTodo, findTodoById, findTodosByUserId, updateTodo, deleteTodoById };
