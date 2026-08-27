const { createCategory, listCategories, deleteCategory } = require('./category.service');

function validationError(message) {
  const err = new Error(message);
  err.status = 400;
  err.code = 'VALIDATION_ERROR';
  return err;
}

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const postCategory = asyncHandler(async (req, res) => {
  const { name } = req.body || {};
  if (!name || name.length < 1 || name.length > 50) throw validationError('이름은 1~50자여야 합니다.');
  const category = await createCategory(req.user.id, name);
  res.status(201).json(category);
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await listCategories(req.user.id);
  res.status(200).json(categories);
});

const deleteCategoryHandler = asyncHandler(async (req, res) => {
  await deleteCategory(req.user.id, req.params.id);
  res.status(204).send();
});

module.exports = { postCategory, getCategories, deleteCategoryHandler };
