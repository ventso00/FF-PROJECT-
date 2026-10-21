import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import type { Creator } from '@/lib/types';
import { Page, Spinner, EmptyState } from '@/components/Common';
import { Search, Video } from 'lucide-react';

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('toutes');

  useEffect(() => {
    document.title = 'Créateurs — MadaFF Hub';
    supabase
      .from('creators')
      .select('*')
      .order('name', { ascending: true })
      .then(({ data, error: queryError }) => {
        if (queryError) {
          setError(true);
          setCreators([]);
        } else {
          setCreators(data ?? []);
        }
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (creators ?? []).forEach((c) => (c.categories ?? []).forEach((cat) => set.add(cat)));
    return Array.from(set).sort();
  }, [creators]);

  const filtered = useMemo(() => {
    let list = creators ?? [];
    if (category !== 'toutes') list = list.filter((c) => (c.categories ?? []).includes(category));
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || (c.bio ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [creators, search, category]);

  return (
    <Page>
      <h1 className="animate-fade-up font-display text-4xl font-bold uppercase tracking-wide heading-glare sm:text-5xl">
        <span className="text-fire">Créateurs</span> de contenu
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ash-400 sm:text-base">
        Les créateurs de contenu Free Fire de la scène malgache : streams, gameplay, conseils et analyses.
        Cette annuaire est informatif — aucun classement de popularité n'est établi.
      </p>

      <div className="mt-6 grid animate-fade-up gap-3 rounded-xl border border-white/10 bg-ash-900/80 p-4 sm:grid-cols-2">
        <div>
          <label htmlFor="creators-search" className="sr-only">
            Rechercher un créateur
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
            <input
              id="creators-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un créateur…"
              className="input-dark pl-9"
            />
          </div>
        </div>
        <div>
          <label htmlFor="creators-category" className="label-dark">
            Catégorie
          </label>
          <select
            id="creators-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-dark"
          >
            <option value="toutes" className="bg-ash-900">Toutes</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-ash-900">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {creators === null ? (
        <Spinner />
      ) : error ? (
        <div className="mt-6">
          <EmptyState title="Impossible de charger les créateurs" hint="Vérifiez votre connexion puis rechargez." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Aucun créateur ne correspond"
            hint="Essayez d'élargir vos critères, ou revenez plus tard — l'annuaire s'étoffe progressivement."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((creator) => (
            <Link
              key={creator.id}
              href={`/createurs/${creator.slug}`}
              className="card-dark card-hover group p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/25 to-ember-500/15 text-amber-300 ring-1 ring-amber-500/30 transition group-hover:scale-105">
                  <Video className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold uppercase leading-none tracking-wide text-white transition group-hover:text-fire">{creator.name}</h2>
              {(creator.categories ?? []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {creator.categories.map((cat) => (
                    <span
                      key={cat}
                      className="chip text-ember-300"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
              {creator.bio && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ash-400">{creator.bio}</p>}
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}
