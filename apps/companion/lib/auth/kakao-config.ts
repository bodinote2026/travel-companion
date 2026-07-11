import { DEFAULT_APP_ORIGIN, resolveAppOrigin } from '@/lib/app-url';

export function getKakaoRestApiKey(): string {
  const key = process.env.KAKAO_REST_API_KEY?.trim();
  if (!key) {
    throw new Error('KAKAO_REST_API_KEY가 설정되지 않았습니다.');
  }
  return key;
}

export function getKakaoClientSecret(): string | undefined {
  const secret = process.env.KAKAO_CLIENT_SECRET?.trim();
  return secret || undefined;
}

/**
 * 카카오디벨로퍼스에 등록한 Redirect URI와 일치해야 함.
 * 우선순위: KAKAO_REDIRECT_URI(vercel.app 제외 가능) → 요청 origin → NEXT_PUBLIC_APP_URL → donghaeng.me
 */
export function getKakaoRedirectUri(origin?: string): string {
  const configured = process.env.KAKAO_REDIRECT_URI?.trim();
  const appOrigin = resolveAppOrigin(origin);

  if (configured) {
    const normalized = configured.replace(/\/$/, '');
    // 잘못 vercel 배포 URL로 고정된 경우, 공개 도메인으로 교체
    if (/vercel\.app/i.test(normalized)) {
      return `${appOrigin}/api/auth/kakao/callback`;
    }
    return normalized;
  }

  return `${appOrigin}/api/auth/kakao/callback`;
}

export function isKakaoLoginConfigured(): boolean {
  return Boolean(process.env.KAKAO_REST_API_KEY?.trim());
}

export { DEFAULT_APP_ORIGIN };
