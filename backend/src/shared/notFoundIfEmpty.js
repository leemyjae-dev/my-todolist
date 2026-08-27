function notFoundIfEmpty(value, message = '리소스를 찾을 수 없습니다.') {
  if (!value) {
    const err = new Error(message);
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }
  return value;
}

module.exports = notFoundIfEmpty;
