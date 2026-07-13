import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques qui doivent rester accessibles à TOUS les visiteurs
  // sans redirection ou protection
  const publicRoutes = [
    '/suivi',      // Suivi de commande (public)
    '/tarifs',     // Page tarifs (public)
    '/api',        // API endpoints (peuvent être protégées mais pas ici)
  ];

  // Routes du vendeur (group seller) qui nécessitent d'être dans le dashboard
  const sellerRoutes = [
    '/accueil',
    '/commandes',
    '/produits',
    '/boutique',
    '/livreurs',
    '/entrer',
    '/onboarding',
  ];

  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    // Routes publiques : ne pas toucher, laisser passer
    return NextResponse.next();
  }

  // Vérifier si c'est une route du vendeur (seller group)
  const isSellerRoute = sellerRoutes.some(route => pathname.startsWith(route));

  if (isSellerRoute) {
    // Route seller : laisser passer (elle s'affichera avec le layout seller)
    return NextResponse.next();
  }

  // Si aucun des patterns ci-dessus, c'est probablement une route [slug] client
  // Comme /boutique-de-fatou, /boutique-de-fatou/panier, etc.
  // Laisser passer sans modification
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Appliquer le middleware à tous les chemins SAUF:
     * - _next (Next.js internals)
     * - favicon.ico
     * - fichiers statiques
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
