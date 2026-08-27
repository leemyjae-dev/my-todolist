const { signup, login, refreshAccessToken } = require('./auth.service');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validationError(message) {
  const err = new Error(message);
  err.status = 400;
  err.code = 'VALIDATION_ERROR';
  return err;
}

const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const postSignup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) throw validationError('올바른 이메일 형식이 아닙니다.');
  if (!password || password.length < 8) throw validationError('비밀번호는 8자 이상이어야 합니다.');
  if (!name || name.length < 1 || name.length > 50) throw validationError('이름은 1~50자여야 합니다.');
  const user = await signup({ email, password, name });
  res.status(201).json(user);
});

const postLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw validationError('이메일과 비밀번호를 입력해주세요.');
  const result = await login({ email, password });
  res.status(200).json(result);
});

const postTokenRefresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) throw validationError('refreshToken이 필요합니다.');
  const result = await refreshAccessToken(refreshToken);
  res.status(200).json(result);
});

module.exports = { postSignup, postLogin, postTokenRefresh };
