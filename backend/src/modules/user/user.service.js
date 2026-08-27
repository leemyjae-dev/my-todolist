const bcrypt = require('bcrypt');
const { findUserById, updateUser } = require('../../db/queries/user.queries');

async function getMe(userId) {
  const user = await findUserById(userId);
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

async function updateMe(userId, { name, password }) {
  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
  const user = await updateUser(userId, { name, passwordHash });
  console.log('[user] updated', userId);
  return user;
}

module.exports = { getMe, updateMe };
