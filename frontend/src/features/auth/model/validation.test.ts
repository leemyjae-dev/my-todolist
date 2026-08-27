import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateName } from './validation';

describe('validateEmail', () => {
  it('빈 문자열이면 에러 메시지를 반환한다', () => {
    expect(typeof validateEmail('')).toBe('string');
  });

  it('형식이 잘못되면 에러 메시지를 반환한다', () => {
    expect(typeof validateEmail('invalid-email')).toBe('string');
  });

  it('올바른 형식이면 null을 반환한다', () => {
    expect(validateEmail('a@b.com')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('빈 문자열이면 에러 메시지를 반환한다', () => {
    expect(typeof validatePassword('')).toBe('string');
  });

  it('7자면 에러 메시지를 반환한다', () => {
    expect(typeof validatePassword('1234567')).toBe('string');
  });

  it('8자면 null을 반환한다', () => {
    expect(validatePassword('12345678')).toBeNull();
  });
});

describe('validateName', () => {
  it('빈 문자열이면 에러 메시지를 반환한다', () => {
    expect(typeof validateName('')).toBe('string');
  });

  it('51자면 에러 메시지를 반환한다', () => {
    expect(typeof validateName('a'.repeat(51))).toBe('string');
  });

  it('정상 이름이면 null을 반환한다', () => {
    expect(validateName('홍길동')).toBeNull();
  });
});
