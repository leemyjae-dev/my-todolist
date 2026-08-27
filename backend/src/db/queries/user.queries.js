const pool = require('../pool');

async function createUser({ email, passwordHash, name }) {
  const { rows } = await pool.query(
    `INSERT INTO users(email, password, name) VALUES ($1,$2,$3)
     RETURNING id, email, name, created_at AS "createdAt", updated_at AS "updatedAt"`,
    [email, passwordHash, name]
  );
  return rows[0];
}

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, email, password, name, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, email, password, name, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function updateUser(id, { name, passwordHash } = {}) {
  const { rows } = await pool.query(
    `UPDATE users SET
       name = COALESCE($2, name),
       password = COALESCE($3, password),
       updated_at = now()
     WHERE id = $1
     RETURNING id, email, name, created_at AS "createdAt", updated_at AS "updatedAt"`,
    [id, name ?? null, passwordHash ?? null]
  );
  return rows[0] || null;
}

module.exports = { createUser, findUserByEmail, findUserById, updateUser };
