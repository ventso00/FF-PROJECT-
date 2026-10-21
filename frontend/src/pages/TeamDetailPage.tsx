import { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { supabase } from '@/lib/supabase';
import type { ResultRow, Team, TeamMember } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Page, Spinner, EmptyState, ReportButton } from '@/components/Common';
import { ExternalLink, ShieldCheck, Swords, Trophy, User } from 'lucide-react';

export default function TeamDetailPage() {
  const [match, params] = useRoute('/equipes/:slug');
  if (!match) return null;
  return <TeamDetail slug={params.slug} />;
}

interface TeamEvent {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
}

function TeamDetail({ slug }: { slug: string }) {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teamResults, setTeamResults] = useState<ResultRow[]>([]);
  const [teamEvents, setTeamEvents] = useState<TeamEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('teams')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setTeam(data);
        document.title = `${data.name} — MadaFF Hub`;
        Promise.all([
          supabase.from('team_members').select('*').eq('team_id', data.id).order('joined_at'),
          supabase.from('results').select('*').eq('team_id', data.id).order('published_at', { ascending: false }),
        ]).then(([membersRes, resultsRes]) => {
          if (cancelled) return;
          setMembers(membersRes.data ?? []);
          const results = resultsRes.data ?? [];
          setTeamResults(results);
          const eventIds = Array.from(new Set(results.map((r) => r.event_id)));
          if (eventIds.length > 0) {
            supabase
              .from('events')
              .select('id,title,slug,starts_at')
              .in('id', eventIds)
              .eq('publication_status', 'publie')
              .then(({ data: eventsData }) => {
                if (!cancelled) {
                  setTeamEvents(eventsData ?? []);
                  setLoading(false);
                }
              });
          } else {
            setLoading(false);
          }
        });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <Spinner />;
  if (notFound || !team) {
    return (
      <Page>
        <EmptyState title="Équipe introuvable" hint="Cette équipe n'existe pas ou a été retirée." />
        <div className="mt-4 text-center">
          <Link href="/equipes" className="text-sm font-bold uppercase tracking-wider text-ember-400 hover:text-ember-300">
            Retour à l'annuaire
          </Link>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <Link href="/equipes" className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-ash-400 transition hover:text-ember-400">
        ← Annuaire des équipes
      </Link>

      <div className="mt-3 animate-fade-up rounded-2xl border border-white/10 bg-ash-900/80 p-6 shadow-xl shadow-black/30 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ember-500 to-amber-500 font-display text-2xl font-bold text-white shadow-lg shadow-ember-500/30">
            {team.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-wide text-white sm:text-5xl">{team.name}</h1>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-ash-400">
              {team.region ? `Région : ${team.region}` : 'Région non précisée'}
              {team.owner_name && <> · Responsable : {team.owner_name}</>}
            </p>
          </div>
          {team.recruiting && (
            <span className="chip ml-auto bg-emerald-500/15 py-1.5 text-sm text-emerald-300 ring-emerald-400/40">
              <User className="h-4 w-4" aria-hidden /> Recherche des joueurs
            </span>
          )}
        </div>

        {team.description && <p className="mt-4 leading-relaxed text-ash-200">{team.description}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4">
          {team.contact_url && (
            <a
              href={team.contact_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-ember-400 transition hover:text-ember-300"
            >
              Page officielle <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          )}
          {team.verified_at && (
            <p className="flex items-center gap-1.5 text-xs text-ash-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden />
              Page vérifiée le {formatDate(team.verified_at)}
            </p>
          )}
          <div className="ml-auto">
            <ReportButton contentType="team" contentId={team.id} contentLabel={team.name} />
          </div>
        </div>
      </div>

      <div className="mb-16 mt-6 grid gap-6 lg:grid-cols-2 md:mb-0">
        <section className="rounded-2xl border border-white/10 bg-ash-900/80 p-6 shadow-xl shadow-black/30" aria-labelledby="members-title">
          <h2 id="members-title" className="font-display text-2xl font-semibold uppercase tracking-wide text-white">
            Membres affichés
          </h2>
          <p className="mt-0.5 text-xs text-ash-500">
            Seuls les membres ayant donné leur accord apparaissent ici.
          </p>
          {members.length === 0 ? (
            <p className="mt-4 text-sm text-ash-400">Aucun membre affiché pour le moment.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/5">
              {members.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5">
                  <span className="font-semibold text-white">{m.nickname}</span>
                  <span className="chip text-ember-300">{m.membership_role}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-ash-900/80 p-6 shadow-xl shadow-black/30" aria-labelledby="records-title">
          <h2 id="records-title" className="flex items-center gap-2 font-display text-2xl font-semibold uppercase tracking-wide text-white">
            <Trophy className="h-5 w-5 text-amber-400" aria-hidden /> Résultats documentés
          </h2>
          {teamResults.length === 0 ? (
            <p className="mt-4 text-sm text-ash-400">Aucun résultat publié pour le moment.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {teamResults.map((r) => {
                const eventInfo = teamEvents.find((e) => e.id === r.event_id);
                return (
                  <li key={r.id} className="rounded-xl border border-white/10 bg-ash-950/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-xl font-semibold uppercase tracking-wide text-ember-300">
                        {r.placement === 1 ? '1er' : `${r.placement}e`} place
                      </span>
                      {r.score !== null && <span className="text-sm font-semibold text-ash-300">{r.score} pts</span>}
                    </div>
                    {eventInfo && (
                      <Link
                        href={`/evenements/${eventInfo.slug}`}
                        className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ember-400 hover:text-ember-300"
                      >
                        <Swords className="h-3.5 w-3.5" aria-hidden />
                        {eventInfo.title}
                      </Link>
                    )}
                    {r.evidence_url && (
                      <a
                        href={r.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-ash-400 hover:text-ash-200"
                      >
                        Source / preuve <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </Page>
  );
}
