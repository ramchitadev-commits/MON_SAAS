import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session-token';

const SELLER_PREFIXES = [
  '/accueil',
  '/commandes',
  '/produits',
  '/boutique',
  '/livreurs',
  '/abonnement',
  '/onboarding',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = SELLER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!needsAuth) return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/entrer';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
