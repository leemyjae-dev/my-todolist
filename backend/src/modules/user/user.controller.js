const { getMe, updateMe } = require('./user.service');

function validationError(message) {
  const err = new Error(message);
  err.status = 400;
  err.code = 'VALIDATION_ERROR';
  return err;
}

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const getMeHandler = asyncHandler(async (req, res) => {
  const user = await getMe(req.user.id);
  res.status(200).json(user);
});

const patchMeHandler = asyncHandler(async (req, res) => {
  const { name, password } = req.body || {};
  if (name !== undefined && (name.length < 1 || name.length > 50)) {
    throw validationError('이름은 1~50자여야 합니다.');
  }
  if (password !== undefined && password.length < 8) {
    throw validationError('비밀번호는 8자 이상이어야 합니다.');
  }
  const user = await updateMe(req.user.id, { name, password });
  res.status(200).json(user);
});

module.exports = { getMeHandler, patchMeHandler };
