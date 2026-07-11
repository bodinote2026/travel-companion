/** 프로덕션 공개 도메인 (커스텀 도메인) */
export const DEFAULT_APP_ORIGIN = 'https://donghaeng.me';

function isVercelDeploymentHost(hostOrOrigin: string): boolean {
  return /(?:^|[/.])vercel\.app(?:$|\/)/i.test(hostOrOrigin);
}

/**
 * 요청이 들어온 공개 origin.
 * Vercel 배포 호스트(*.vercel.app)보다 커스텀 도메인·NEXT_PUBLIC_APP_URL을 우선한다.
 */
export function getRequestOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || '';
  const forwardedHost =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host')?.split(',')[0]?.trim() ||
    '';
  const forwardedProto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';

  if (forwardedHost && !isVercelDeploymentHost(forwardedHost)) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
  }

  if (configured && !isVercelDeploymentHost(configured)) {
    return configured;
  }

  if (configured) return configured;

  try {
    const origin = new URL(request.url).origin;
    if (!isVercelDeploymentHost(origin)) return origin;
  } catch {
    /* ignore */
  }

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, '');
  }

  return DEFAULT_APP_ORIGIN;
}

/** 환경변수·origin 후보 중 공개 앱 URL (trailing slash 없음) */
export function resolveAppOrigin(origin?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || '';

  if (origin && !isVercelDeploymentHost(origin)) {
    return origin.replace(/\/$/, '');
  }
  if (configured && !isVercelDeploymentHost(configured)) {
    return configured;
  }
  if (configured) return configured;
  if (origin) return origin.replace(/\/$/, '');
  return DEFAULT_APP_ORIGIN;
}
