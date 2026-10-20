import { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { supabase } from '@/lib/supabase';
import type { Creator } from '@/lib/types';
import { Page, Spinner, EmptyState } from '@/components/Common';
import { ReportButton } from '@/components/Common';
import { ArrowLeft, ExternalLink, CalendarClock, Video } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function CreatorDetailPage() {
  const [match, params] = useRoute('/createurs/:slug');
  const [creator, setCreator] = useState<Creator | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const slug = params?.slug;

  useEffect(() => {
    if (!match || !slug) return;
    setCreator(null);
    setNotFound(false);
    setLoadError(false);
    supabase
      .from('creators')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (queryError) setLoadError(true);
        else if (!data) setNotFound(true);
        else {
          setCreator(data);
          document.title = `${data.name} — Créateur — MadaFF Hub`;
        }
      });
  }, [match, slug]);

  if (!match) return null;

  if (loadError) {
    return (
      <Page>
        <EmptyState title="Impossible de charger ce créateur" hint="Vérifiez votre connexion puis rechargez." />
        <BackLink />
      </Page>
    );
  }
  if (notFound) {
    return (
      <Page>
        <EmptyState title="Créateur introuvable" hint="Cette fiche n'existe pas ou n'est pas encore publiée." />
        <BackLink />
      </Page>
    );
  }
  if (!creator) {
    return (
      <Page>
        <Spinner />
      </Page>
    );
  }

  const links = Array.isArray(creator.links) ? creator.links : [];

  return (
    <Page>
      <BackLink />

      <article className="mt-4 animate-fade-up rounded-2xl border border-white/10 bg-ash-900/80 p-6 shadow-xl shadow-black/30 sm:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/25 to-ember-500/15 text-amber-300 ring-1 ring-amber-500/30">
            <Video className="h-7 w-7" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-wide text-white sm:text-5xl">{creator.name}</h1>
            {(creator.categories ?? []).length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
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
          </div>
        </div>

        {creator.bio && (
          <p className="mt-4 text-sm leading-relaxed text-ash-200 sm:text-base">{creator.bio}</p>
        )}

        {links.length > 0 && (
          <section className="mt-6" aria-label="Liens du créateur">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ash-400">Chaînes et contenus</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ember-500/30 bg-ember-500/10 px-3.5 py-2 text-sm font-bold uppercase tracking-wide text-ember-300 transition hover:border-ember-400/60 hover:bg-ember-500/20 hover:text-white"
                  >
                    {link.label || 'Lien'}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ash-500">
              Ces liens pointent vers des plateformes externes gérées par leurs propriétaires.
            </p>
          </section>
        )}

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="flex items-center gap-1.5 text-xs text-ash-400">
            <CalendarClock className="h-3.5 w-3.5 text-ember-400" aria-hidden />
            Fiche vérifiée le {creator.verified_at ? formatDateTime(creator.verified_at) : '—'}
          </p>
          <ReportButton contentType="other" contentId={creator.id} contentLabel={`Créateur : ${creator.name}`} />
        </footer>
      </article>
    </Page>
  );
}

function BackLink() {
  return (
    <Link
      href="/createurs"
      className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-ash-400 transition hover:text-ember-400"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden /> Tous les créateurs
    </Link>
  );
}
