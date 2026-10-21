import { useEffect, useState } from 'react';
import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { EmptyState, Spinner } from '@/components/Common';
import { formatNewsDate, loadNews, type NewsItem } from '@/lib/news';

export default function NewsFeed({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadNews().then(setItems).catch(() => setError(true));
  }, []);

  if (items === null && !error) return <Spinner label="Chargement des actualités…" />;
  if (error) {
    return <EmptyState title="Actualités momentanément indisponibles" hint="La veille sera actualisée automatiquement." />;
  }
  if (!items?.length) {
    return <EmptyState title="Aucune actualité vérifiée aujourd’hui" hint="Les nouvelles sources seront examinées lors de la prochaine veille." />;
  }

  const visible = compact ? items.slice(0, 3) : items;
  return (
    <div className="space-y-3">
      {visible.map((item) => (
        <article key={item.id} className="card-dark card-hover p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ember-500/15 text-ember-400 ring-1 ring-ember-500/30">
              <Newspaper className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-wider text-ash-500">
                <span>{item.source}</span><span aria-hidden>·</span><time dateTime={item.publishedAt}>{formatNewsDate(item.publishedAt)}</time>
              </div>
              <h3 className="mt-1 text-base font-bold leading-snug text-white sm:text-lg">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ash-300">{item.summary}</p>
              <a href={item.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-3 inline-flex max-w-full items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ember-400 hover:text-ember-300">
                Lire la source <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </a>
            </div>
          </div>
        </article>
      ))}
      {compact && items.length > visible.length && (
        <Link href="/actualites" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ember-400 hover:text-ember-300">
          Voir toutes les actualités <RefreshCw className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
