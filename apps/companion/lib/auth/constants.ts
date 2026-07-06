export const SESSION_COOKIE_NAME = 'companion_session';
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export function getOtpExpiresMinutes(): number {
  const n = Number(process.env.OTP_EXPIRES_MINUTES ?? '5');
  return Number.isFinite(n) && n > 0 ? n : 5;
}

export function getOtpResendCooldownSeconds(): number {
  const n = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? '60');
  return Number.isFinite(n) && n >= 0 ? n : 60;
}

export function requireAuthSessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SESSION_SECRET 환경 변수가 설정되지 않았습니다.');
  }
  return secret;
}
