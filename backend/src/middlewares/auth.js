const { verifyAccessToken } = require('../shared/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[auth] unauthorized', req.method, req.path);
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } });
  }

  const token = authHeader.slice('Bearer '.length);
  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub };
    next();
  } catch (err) {
    console.warn('[auth] unauthorized', req.method, req.path);
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } });
  }
}

module.exports = authMiddleware;
