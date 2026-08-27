const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email) return '이메일을 입력해주세요.';
  if (!EMAIL_RE.test(email)) return '올바른 이메일 형식이 아닙니다.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return '비밀번호를 입력해주세요.';
  if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
  return null;
}

export function validateName(name: string): string | null {
  if (!name || name.length < 1 || name.length > 50) return '이름은 1~50자여야 합니다.';
  return null;
}
