import { useEffect } from 'react';
import { Newspaper, ShieldCheck } from 'lucide-react';
import { Page } from '@/components/Common';
import NewsFeed from '@/components/NewsFeed';

export default function NewsPage() {
  useEffect(() => {
    document.title = 'Actualités Free Fire à Madagascar — MadaFF Hub';
  }, []);
  return (
    <Page>
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ember-500/15 text-ember-400 ring-1 ring-ember-500/30">
            <Newspaper className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide heading-glare sm:text-5xl">Actualités <span className="text-fire">MadaFF</span></h1>
            <p className="mt-1.5 text-sm leading-relaxed text-ash-400 sm:text-base">Une veille quotidienne des nouvelles publiques liées à Free Fire et à l’esport à Madagascar.</p>
          </div>
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-100" role="note">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
          <p>Les liens sont affichés avec leur source et leur date. Une actualité n’est pas une annonce officielle tant qu’elle n’a pas été vérifiée par la modération.</p>
        </div>
        <section className="mt-8" aria-label="Actualités Free Fire Madagascar">
          <NewsFeed />
        </section>
      </div>
    </Page>
  );
}
