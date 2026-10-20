import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import type { Creator, EventRow, Team } from '@/lib/types';
import { EventCard } from '@/components/EventCard';
import { Page, EmptyState } from '@/components/Common';
import {
  ArrowRight, CalendarPlus, Megaphone, Search, ShieldCheck, Users, Video, Flame, ChevronRight,
} from 'lucide-react';

const HERO_IMAGES = [
  'https://images.pexels.com/photos/9072394/pexels-photo-9072394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7862518/pexels-photo-7862518.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/9071735/pexels-photo-9071735.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7849511/pexels-photo-7849511.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const SHOWCASE = [
  'https://images.pexels.com/photos/9072216/pexels-photo-9072216.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/9072252/pexels-photo-9072252.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/9072388/pexels-photo-9072388.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7862673/pexels-photo-7862673.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/9071735/pexels-photo-9071735.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="absolute inset-0" aria-hidden>
      {HERO_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          loading={i === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === index ? 'opacity-100 animate-ken-burns' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-ash-950 via-ash-950/75 to-ash-950/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-ash-950/90 via-transparent to-ash-950/60" />
    </div>
  );
}

function AngledShowcase() {
  return (
    <div className="relative mx-auto mt-12 hidden h-56 max-w-5xl items-center justify-center md:flex" aria-hidden>
      <div className="flex items-center gap-4 [perspective:1200px]">
        {SHOWCASE.map((src, i) => {
          const center = Math.floor(SHOWCASE.length / 2);
          const offset = i - center;
          return (
            <div
              key={src}
              className="relative h-52 w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50 transition-transform duration-700"
              style={{
                transform: `rotateY(${offset * 14}deg) translateZ(${-Math.abs(offset) * 45}px) translateY(${Math.abs(offset) * 8}px)`,
                zIndex: 10 - Math.abs(offset),
              }}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {offset === 0 && (
                <span className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 animate-pulse bg-gradient-to-b from-transparent via-ember-400 to-transparent" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [upcoming, setUpcoming] = useState<EventRow[] | null>(null);
  const [recent, setRecent] = useState<EventRow[] | null>(null);
  const [featuredTeams, setFeaturedTeams] = useState<Team[] | null>(null);
  const [creators, setCreators] = useState<Creator[] | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    document.title = 'MadaFF Hub — Événements Free Fire à Madagascar';
    async function load() {
      const now = new Date().toISOString();
      const [upcomingRes, recentRes, teamsRes, creatorsRes, settingsRes] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('publication_status', 'publie')
          .gte('starts_at', now)
          .neq('verification_status', 'annule')
          .order('starts_at', { ascending: true })
          .limit(4),
        supabase
          .from('events')
          .select('*')
          .eq('publication_status', 'publie')
          .order('published_at', { ascending: false })
          .limit(3),
        supabase.from('teams').select('*').eq('is_featured', true).order('name').limit(4),
        supabase.from('creators').select('*').order('updated_at', { ascending: false }).limit(3),
        supabase.from('site_settings').select('announcement').eq('id', 'main').maybeSingle(),
      ]);
      if (upcomingRes.error || recentRes.error || teamsRes.error || creatorsRes.error || settingsRes.error) {
        setLoadError(true);
      }
      setUpcoming(upcomingRes.data ?? []);
      setRecent(recentRes.data ?? []);
      setFeaturedTeams(teamsRes.data ?? []);
      setCreators(creatorsRes.data ?? []);
      setAnnouncement(settingsRes.data?.announcement ?? null);
    }
    load();
  }, []);

  const loading = upcoming === null || recent === null || featuredTeams === null || creators === null;

  return (
    <div>
      {/* HERO */}
      <section className="relative -mt-8 overflow-hidden px-4 pb-16 pt-24 sm:px-6">
        <HeroSlideshow />
        <div className="relative mx-auto max-w-6xl">
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-ember-500/40 bg-ember-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ember-300">
            <Flame className="h-4 w-4 animate-flicker" aria-hidden /> Communauté Free Fire · Madagascar
          </p>
          <h1 className="mt-4 max-w-3xl animate-fade-up font-display text-5xl font-bold uppercase leading-[0.95] tracking-wide text-white [animation-delay:100ms] sm:text-6xl lg:text-7xl">
            Trouvez les <span className="text-fire">tournois</span>, les équipes et les annonces de la scène <span className="text-fire">malgache</span>.
          </h1>
          <p className="mt-4 max-w-xl animate-fade-up text-base leading-relaxed text-ash-200 [animation-delay:200ms] sm:text-lg">
            MadaFF Hub rassemble les événements communautaires vérifiés, l'annuaire des équipes et les informations
            fiables — au même endroit, gratuitement, sans compte obligatoire.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 animate-fade-up [animation-delay:300ms]">
            <Link href="/evenements" className="btn-fire animate-pulse-glow text-base">
              <Search className="h-5 w-5" aria-hidden /> Découvrir les événements
            </Link>
            <Link href="/proposer" className="btn-ghost text-base">
              <CalendarPlus className="h-5 w-5" aria-hidden /> Organisateur : proposer un événement
            </Link>
          </div>
          <AngledShowcase />
        </div>
      </section>

      <Page>
        {announcement && (
          <div className="animate-fade-up flex items-start gap-3 rounded-xl border border-ember-500/30 bg-ember-500/10 p-4" role="note">
            <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-ember-400" aria-hidden />
            <p className="text-sm font-medium leading-relaxed text-ember-100">{announcement}</p>
          </div>
        )}

        {loadError && (
          <div className="mt-6">
            <EmptyState
              title="Impossible de charger les données"
              hint="Vérifiez votre connexion puis rechargez la page."
            />
          </div>
        )}

        {loading ? null : (
          <>
            <section className="mt-12" aria-labelledby="upcoming-title">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <h2 id="upcoming-title" className="font-display text-3xl font-semibold uppercase tracking-wide heading-glare sm:text-4xl">
                  Prochains <span className="text-fire">affrontements</span>
                </h2>
                <Link
                  href="/evenements"
                  className="inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-ember-400 transition hover:gap-2 hover:text-ember-300"
                >
                  Tout voir <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              {upcoming.length === 0 ? (
                <EmptyState
                  title="Aucun événement à venir pour le moment"
                  hint="Les organisateurs peuvent proposer un événement depuis le bouton ci-dessus."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {upcoming.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-14" aria-labelledby="teams-title">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <h2 id="teams-title" className="font-display text-3xl font-semibold uppercase tracking-wide heading-glare sm:text-4xl">
                  Équipes <span className="text-fire">en lice</span>
                </h2>
                <Link
                  href="/equipes"
                  className="inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-ember-400 transition hover:gap-2 hover:text-ember-300"
                >
                  Annuaire complet <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              {featuredTeams.length === 0 ? (
                <EmptyState title="Aucune équipe mise en avant" />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {featuredTeams.map((team) => (
                    <Link
                      key={team.id}
                      href={`/equipes/${team.slug}`}
                      className="card-dark card-hover group flex items-center gap-4 p-5"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ember-500/20 to-amber-500/10 text-ember-400 ring-1 ring-ember-500/30 transition group-hover:scale-105">
                        <Users className="h-7 w-7" aria-hidden />
                      </span>
                      <div className="flex-1">
                        <p className="font-display text-2xl font-semibold uppercase leading-none tracking-wide text-white transition group-hover:text-fire">{team.name}</p>
                        <p className="mt-1 text-sm text-ash-400">{team.region ?? 'Région non précisée'}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-ash-500 transition group-hover:translate-x-1 group-hover:text-ember-400" aria-hidden />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-14" aria-labelledby="creators-title">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <h2 id="creators-title" className="font-display text-3xl font-semibold uppercase tracking-wide heading-glare sm:text-4xl">
                  Créateurs à <span className="text-fire">suivre</span>
                </h2>
                <Link
                  href="/createurs"
                  className="inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-ember-400 transition hover:gap-2 hover:text-ember-300"
                >
                  Annuaire complet <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              {creators.length === 0 ? (
                <EmptyState
                  title="Aucun créateur pour le moment"
                  hint="L'annuaire des créateurs de contenu s'étoffe au fil des vérifications."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  {creators.map((creator) => (
                    <Link
                      key={creator.id}
                      href={`/createurs/${creator.slug}`}
                      className="card-dark card-hover group flex items-center gap-4 p-5"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-ember-500/10 text-amber-300 ring-1 ring-amber-500/30 transition group-hover:scale-105">
                        <Video className="h-7 w-7" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-2xl font-semibold uppercase leading-none tracking-wide text-white transition group-hover:text-fire">{creator.name}</p>
                        <p className="mt-1 truncate text-sm text-ash-400">
                          {(creator.categories ?? []).join(' · ') || 'Créateur de contenu'}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-ash-500 transition group-hover:translate-x-1 group-hover:text-ember-400" aria-hidden />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-14" aria-labelledby="recent-title">
              <h2 id="recent-title" className="mb-5 font-display text-3xl font-semibold uppercase tracking-wide heading-glare sm:text-4xl">
                Dernières <span className="text-fire">publications</span>
              </h2>
              {recent.length === 0 ? (
                <EmptyState title="Aucune publication pour le moment" />
              ) : (
                <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-ash-900/80">
                  {recent.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/evenements/${event.slug}`}
                        className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/5"
                      >
                        <span className="font-semibold text-ash-100 transition group-hover:text-ember-300">{event.title}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-ash-500 transition group-hover:translate-x-1 group-hover:text-ember-400" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-14 grid gap-4 sm:grid-cols-3" aria-label="Engagements de la plateforme">
              {[
                { icon: ShieldCheck, color: 'text-emerald-400', ring: 'ring-emerald-500/30', from: 'from-emerald-500/20', title: 'Informations vérifiées', text: 'Chaque annonce affiche sa source et sa date de dernière vérification.' },
                { icon: Users, color: 'text-ember-400', ring: 'ring-ember-500/30', from: 'from-ember-500/20', title: 'Pour la communauté', text: 'Consultation gratuite, sans compte. Un signalement possible en un clic.' },
                { icon: CalendarPlus, color: 'text-sky-400', ring: 'ring-sky-500/30', from: 'from-sky-500/20', title: 'Pour les organisateurs', text: 'Publiez votre tournoi sur une page partageable, sans créer de site web.' },
              ].map(({ icon: Icon, color, ring, from, title, text }) => (
                <div key={title} className="card-dark card-hover p-5">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${from} to-transparent ${ring} ${color}`}>
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-3 font-display text-2xl font-semibold uppercase tracking-wide text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ash-400">{text}</p>
                </div>
              ))}
            </section>
          </>
        )}
      </Page>
    </div>
  );
}
