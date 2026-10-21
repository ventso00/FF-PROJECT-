import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { EventRow } from '@/lib/types';
import { REGIONS } from '@/lib/types';
import { EventCard } from '@/components/EventCard';
import { EmptyState, Page, Spinner } from '@/components/Common';
import { Search } from 'lucide-react';

type StatusFilter = 'a_venir' | 'termines' | 'tous';
type TypeFilter = 'tous' | 'en_ligne' | 'presentiel';

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('a_venir');
  const [type, setType] = useState<TypeFilter>('tous');
  const [region, setRegion] = useState('toutes');
  const [mode, setMode] = useState('tous');

  useEffect(() => {
    document.title = 'Événements — MadaFF Hub';
    supabase
      .from('events')
      .select('*')
      .eq('publication_status', 'publie')
      .order('starts_at', { ascending: true })
      .then(({ data, error: queryError }) => {
        if (queryError) {
          setError('Impossible de charger les événements pour le moment.');
          setEvents([]);
        } else {
          setEvents(data ?? []);
        }
      });
  }, []);

  const modes = useMemo(() => {
    const set = new Set<string>();
    (events ?? []).forEach((e) => set.add(e.game_mode));
    return Array.from(set).sort();
  }, [events]);

  const filtered = useMemo(() => {
    let list = events ?? [];
    const now = Date.now();
    if (status === 'a_venir') list = list.filter((e) => new Date(e.starts_at).getTime() >= now && e.verification_status !== 'annule');
    if (status === 'termines') list = list.filter((e) => new Date(e.starts_at).getTime() < now || e.verification_status === 'annule');
    if (type !== 'tous') list = list.filter((e) => e.event_type === type);
    if (region !== 'toutes') list = list.filter((e) => e.region === region);
    if (mode !== 'tous') list = list.filter((e) => e.game_mode === mode);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.organizer_name.toLowerCase().includes(q) ||
          (e.description ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [events, status, type, region, mode, search]);

  const selectClass =
    'w-full rounded-lg border border-white/15 bg-ash-950/60 px-3 py-2 text-sm text-ash-100 focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/30';

  return (
    <Page>
      <h1 className="animate-fade-up font-display text-4xl font-bold uppercase tracking-wide heading-glare sm:text-5xl">
        Catalogue des <span className="text-fire">événements</span>
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ash-400 sm:text-base">
        Tournois communautaires Free Fire à Madagascar. Les archives restent consultables, clairement séparées des
        événements actifs.
      </p>

      <div className="mt-6 grid animate-fade-up gap-3 rounded-xl border border-white/10 bg-ash-900/80 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="events-search" className="sr-only">
            Rechercher un événement
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash-500" aria-hidden />
            <input
              id="events-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre, organisateur, description…"
              className="input-dark pl-9"
            />
          </div>
        </div>
        <div>
          <label htmlFor="filter-status" className="label-dark">
            Statut
          </label>
          <select id="filter-status" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={selectClass}>
            <option value="a_venir" className="bg-ash-900">À venir</option>
            <option value="termines" className="bg-ash-900">Terminés / annulés</option>
            <option value="tous" className="bg-ash-900">Tous</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-type" className="label-dark">
            Type
          </label>
          <select id="filter-type" value={type} onChange={(e) => setType(e.target.value as TypeFilter)} className={selectClass}>
            <option value="tous" className="bg-ash-900">En ligne et présentiel</option>
            <option value="en_ligne" className="bg-ash-900">En ligne</option>
            <option value="presentiel" className="bg-ash-900">Présentiel</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-region" className="label-dark">
            Ville / région
          </label>
          <select id="filter-region" value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
            <option value="toutes" className="bg-ash-900">Toutes</option>
            {REGIONS.map((r) => (
              <option key={r} value={r} className="bg-ash-900">
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-mode" className="label-dark">
            Mode de jeu
          </label>
          <select id="filter-mode" value={mode} onChange={(e) => setMode(e.target.value)} className={selectClass}>
            <option value="tous" className="bg-ash-900">Tous les modes</option>
            {modes.map((m) => (
              <option key={m} value={m} className="bg-ash-900">
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {events === null ? (
        <Spinner />
      ) : error ? (
        <EmptyState title="Une erreur est survenue" hint={error} />
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Aucun événement ne correspond à ces filtres"
            hint="Essayez d'élargir la recherche ou de réinitialiser les filtres."
          />
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm font-bold uppercase tracking-wider text-ash-400" role="status">
            {filtered.length} événement{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </Page>
  );
}
