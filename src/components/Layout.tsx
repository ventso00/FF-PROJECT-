import { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { Gamepad2, Home, LayoutDashboard, Swords, Users, CalendarPlus, Video } from 'lucide-react';

const links = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/evenements', label: 'Événements', icon: Swords },
  { href: '/equipes', label: 'Équipes', icon: Users },
  { href: '/createurs', label: 'Créateurs', icon: Video },
  { href: '/proposer', label: 'Proposer', icon: CalendarPlus },
  { href: '/admin', label: 'Admin', icon: LayoutDashboard },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isActive] = useRoute('/evenements/:slug?');
  const [isHome] = useRoute('/');
  const [isTeams] = useRoute('/equipes/:slug?');
  const [isCreators] = useRoute('/createurs/:slug?');
  const [isPropose] = useRoute('/proposer');
  const [isAdmin] = useRoute('/admin');

  const activeFor = (href: string) =>
    href === '/' ? isHome : href === '/evenements' ? isActive : href === '/equipes' ? isTeams : href === '/createurs' ? isCreators : href === '/proposer' ? isPropose : isAdmin;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ash-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ember-500 to-amber-500 text-white shadow-lg shadow-ember-500/40 transition duration-300 group-hover:scale-105">
            <Gamepad2 className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Mada<span className="text-fire animate-flicker">FF</span> Hub
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-wide transition duration-200 ${
                activeFor(href)
                  ? 'bg-ember-500/15 text-ember-400 shadow-inner'
                  : 'text-ash-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-ash-300 transition hover:bg-white/5 hover:text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="animate-fade-in border-t border-white/10 bg-ash-950/95 px-4 py-2 md:hidden" aria-label="Navigation mobile">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-wide transition ${
                activeFor(href) ? 'bg-ember-500/15 text-ember-400' : 'text-ash-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-ash-900/60">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-bold uppercase tracking-wide text-white">
              Mada<span className="text-fire">FF</span> Hub
            </p>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-ash-400">
              Plateforme communautaire indépendante. Non affiliée à Garena. « Free Fire » est une marque de ses
              propriétaires respectifs. Les événements listés sont organisés par la communauté et vérifiés selon
              notre processus.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-xs text-ash-400">
            <Link href="/confidentialite" className="transition hover:text-ember-400">
              Confidentialité et modération
            </Link>
            <a href="mailto:contact@madaff-hub.example" className="transition hover:text-ember-400">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
