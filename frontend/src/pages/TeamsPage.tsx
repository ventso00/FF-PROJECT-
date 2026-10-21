import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import type { Team } from '@/lib/types';
import { REGIONS } from '@/lib/types';
import { Page, Spinner, EmptyState } from '@/components/Common';
import { MapPin, Search, UserPlus } from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('toutes');
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);

  useEffect(() => {
    document.title = 'Annuaire des équipes — MadaFF Hub';
    supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true })
      .then(({ data, error: queryError }) => {
        if (queryError) {
          setError(true);
          setTeams([]);
        } else {
          setTeams(data ?? []);
        }
      });
  }, []);

  const filtered = useMemo(() => {
    let list = teams ?? [];
    if (region !== 'toutes') list = list.filter((t) => t.region === region);
    if (onlyRecruiting) list = list.filter((t) => t.recruiting);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [teams, search, region, onlyRecruiting]);

  return (
    <Page>
      <h1 className="animate-fade-up font-display text-4xl font-bold uppercase tracking-wide heading-glare sm:text-5xl">
        Annuaire des <span className="text-fire">équipes</span>
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ash-400 sm:text-base">
        Les équipes actives de la scène Free Fire malgache. Les performances affichées proviennent uniquement de
        résultats documentés.
      </p>

      <div className="mt-6 grid animate-fade-up gap-3 rounded-xl border border-white/10 bg-ash-900/80 p-4 sm:grid-cols-2">
        <div>
          <label htmlFor="teams-search" className="sr-only">
            Rechercher une équipe
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
            <input
              id="teams-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une équipe…"
              className="input-dark pl-9"
            />
          </div>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="teams-region" className="label-dark">
              Région
            </label>
            <select
              id="teams-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="input-dark"
            >
              <option value="toutes" className="bg-ash-900">Toutes</option>
              {REGIONS.map((r) => (
                <option key={r} value={r} className="bg-ash-900">
                  {r}
                </option>
              ))}
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm font-semibold text-ash-200">
            <input
              type="checkbox"
              checked={onlyRecruiting}
              onChange={(e) => setOnlyRecruiting(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-ash-950 text-ember-500 focus:ring-ember-500/40"
            />
            Recrute
          </label>
        </div>
      </div>

      {teams === null ? (
        <Spinner />
      ) : error ? (
        <div className="mt-6">
          <EmptyState title="Impossible de charger les équipes" hint="Vérifiez votre connexion puis rechargez." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Aucune équipe ne correspond" hint="Essayez d'élargir vos critères." />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((team) => (
            <Link
              key={team.id}
              href={`/equipes/${team.slug}`}
              className="card-dark card-hover group p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ember-500/25 to-amber-500/15 font-display text-lg font-bold text-ember-300 ring-1 ring-ember-500/30">
                  <span>{team.name.slice(0, 2).toUpperCase()}</span>
                </span>
                {team.recruiting && (
                  <span className="chip bg-emerald-500/15 text-emerald-300 ring-emerald-400/40">
                    <UserPlus className="h-3 w-3" aria-hidden /> Recrute
                  </span>
                )}
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold uppercase leading-none tracking-wide text-white transition group-hover:text-fire">{team.name}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-ash-400">
                <MapPin className="h-3.5 w-3.5 text-ember-400" aria-hidden />
                {team.region ?? 'Région non précisée'}
              </p>
              {team.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ash-400">{team.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}
