import { jwtVerify } from 'jose';
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, requireAuthSessionSecret } from '@/lib/auth/constants';

function safeReturnUrl(pathname: string, search: string): string {
  const path = `${pathname}${search}`;
  if (!path.startsWith('/') || path.startsWith('//')) return '/';
  return path;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set(
      'returnUrl',
      safeReturnUrl(request.nextUrl.pathname, request.nextUrl.search),
    );
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(requireAuthSessionSecret());
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set(
      'returnUrl',
      safeReturnUrl(request.nextUrl.pathname, request.nextUrl.search),
    );
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
    return response;
  }
}

export const config = {
  matcher: ['/chat/:path*', '/mypage/:path*', '/profile/:path*'],
};
