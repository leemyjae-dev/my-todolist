const pool = require('../pool');

// BR-02: 가입 시 기본 카테고리 자동 생성
async function createDefaultCategory(userId, client = pool) {
  const { rows } = await client.query(
    `INSERT INTO categories(user_id, name, is_default) VALUES ($1, '기본', true)
     RETURNING id, name, is_default AS "isDefault"`,
    [userId]
  );
  return rows[0];
}

async function createCategory(userId, name) {
  const { rows } = await pool.query(
    `INSERT INTO categories(user_id, name, is_default) VALUES ($1,$2,false)
     RETURNING id, name, is_default AS "isDefault"`,
    [userId, name]
  );
  return rows[0];
}

async function findCategoriesByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT id, name, is_default AS "isDefault" FROM categories WHERE user_id = $1 ORDER BY name`,
    [userId]
  );
  return rows;
}

// BR-05: 소유권 겸용 조회
async function findCategoryById(id, userId) {
  const { rows } = await pool.query(
    `SELECT id, name, is_default AS "isDefault" FROM categories WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return rows[0] || null;
}

async function findDefaultCategoryByUserId(userId, client = pool) {
  const { rows } = await client.query(
    `SELECT id, name, is_default AS "isDefault" FROM categories WHERE user_id = $1 AND is_default = true`,
    [userId]
  );
  return rows[0] || null;
}

async function deleteCategoryById(id, client = pool) {
  await client.query(`DELETE FROM categories WHERE id = $1`, [id]);
}

module.exports = { createDefaultCategory, createCategory, findCategoriesByUserId, findCategoryById, findDefaultCategoryByUserId, deleteCategoryById };
