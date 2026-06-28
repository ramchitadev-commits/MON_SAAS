'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Tag, RefreshCw, Truck, Settings, LogIn } from 'lucide-react';
import { DooleLogo } from '@/components/logos';
import { resetAllData } from '@/lib/mockData';
import { countActiveOrders } from '@/lib/orders';
import { getShopSettings } from '@/lib/settings';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [badgeCount, setBadgeCount] = useState(0);
  const [storeName, setStoreName] = useState('Boutique de Fatou');

  // Initialise le stockage au premier montage
  useEffect(() => {
    updateBadge();
    const loadStoreName = () =>
      getShopSettings()
        .then((s) => setStoreName(s.name))
        .catch((err) => console.error(err));
    loadStoreName();

    // Ecoute les changements de statut des commandes
    const interval = setInterval(() => {
      updateBadge();
      loadStoreName();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateBadge = () => {
    countActiveOrders()
      .then(setBadgeCount)
      .catch((err) => console.error(err));
  };

  const handleReset = () => {
    if (confirm('Voulez-vous réinitialiser toutes les données de démonstration ?')) {
      resetAllData();
      updateBadge();
      window.location.reload();
    }
  };

  const navItems = [
    { label: 'Accueil', href: '/accueil', icon: Home },
    { label: 'Commandes', href: '/commandes', icon: ClipboardList, badge: true },
    { label: 'Produits', href: '/produits', icon: Tag },
    { label: 'Livreurs', href: '/livreurs', icon: Truck },
    { label: 'Boutique', href: '/boutique', icon: Settings },
  ];

  // Écrans d'authentification / onboarding : plein écran, sans la navigation du dashboard.
  const isAuthRoute = pathname.startsWith('/entrer') || pathname.startsWith('/onboarding');
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20 md:pb-0">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <DooleLogo />
        </div>
        
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Boutique Active</div>
          <div className="text-sm font-bold text-slate-700 mt-1 truncate">{storeName}</div>
          <Link 
            href="/accueil" 
            className="text-xs text-emerald-600 font-medium hover:underline mt-1 inline-block"
          >
            doole.sn/fatou-boutique
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm border border-emerald-100/50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && badgeCount > 0 && (
                  <span className="flex items-center justify-center bg-amber-500 text-white font-bold text-xs h-5 px-2 rounded-full ring-2 ring-white">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <Link
            href="/entrer"
            className="flex items-center gap-2 w-full px-4 py-2 text-xs text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogIn className="h-3.5 w-3.5" />
            Connexion / Onboarding
          </Link>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 w-full px-4 py-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Réinitialiser la Démo
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile / Tablet */}
        <header className="flex md:hidden items-center justify-between h-16 bg-white border-b border-slate-200 px-4 shrink-0">
          <DooleLogo className="h-7" />
          <div className="flex items-center gap-3">
            <Link
              href="/entrer"
              title="Connexion / Onboarding"
              className="p-2 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <LogIn className="h-4 w-4" />
            </Link>
            <button
              onClick={handleReset}
              title="Réinitialiser la Démo"
              className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800 line-clamp-1">{storeName}</div>
              <div className="text-[10px] text-emerald-600">doole.sn/fatou</div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Navigation Mobile Basse (Bottom Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-20 h-full transition-all duration-200 ${
                isActive ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {item.badge && badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white font-bold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                    {badgeCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
