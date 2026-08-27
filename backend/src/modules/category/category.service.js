const pool = require('../../db/pool');
const {
  createCategory: createCategoryQuery,
  findCategoriesByUserId,
  findCategoryById,
  findDefaultCategoryByUserId,
  deleteCategoryById,
} = require('../../db/queries/category.queries');
const { moveCategoryTodos } = require('../../db/queries/todo.queries');
const notFoundIfEmpty = require('../../shared/notFoundIfEmpty');

async function createCategory(userId, name) {
  try {
    const category = await createCategoryQuery(userId, name);
    console.log('[category] created', userId, name);
    return category;
  } catch (err) {
    if (err.code === '23505') { // BR-09: 사용자별 이름 고유
      const dup = new Error('이미 사용 중인 카테고리 이름입니다.');
      dup.status = 409;
      dup.code = 'CATEGORY_NAME_TAKEN';
      throw dup;
    }
    throw err;
  }
}

async function listCategories(userId) {
  return findCategoriesByUserId(userId);
}

async function deleteCategory(userId, categoryId) {
  const category = notFoundIfEmpty(await findCategoryById(categoryId, userId), '카테고리를 찾을 수 없습니다.'); // BR-05
  if (category.isDefault) { // BR-08
    const err = new Error('기본 카테고리는 삭제할 수 없습니다.');
    err.status = 400;
    err.code = 'DEFAULT_CATEGORY_UNDELETABLE';
    throw err;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const defaultCategory = await findDefaultCategoryByUserId(userId, client);
    const moved = await moveCategoryTodos(categoryId, defaultCategory.id, client);
    await deleteCategoryById(categoryId, client);
    await client.query('COMMIT');
    console.log('[category] deleted', categoryId, 'moved', moved, 'todos to default');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { createCategory, listCategories, deleteCategory };
