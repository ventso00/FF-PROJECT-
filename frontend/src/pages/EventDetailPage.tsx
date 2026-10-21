import { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { supabase } from '@/lib/supabase';
import type { EventRow, ResultRow } from '@/lib/types';
import { formatDateTime, formatDate, isRegistrationOpen } from '@/lib/utils';
import { VerificationBadge, TypeBadge } from '@/components/Badges';
import { Page, Spinner, EmptyState, ReportButton } from '@/components/Common';
import {
  CalendarDays, ExternalLink, Trophy, Tv, ShieldCheck, Info, UserCheck, Hourglass, Swords,
} from 'lucide-react';

export default function EventDetailPage() {
  const [match, params] = useRoute('/evenements/:slug');
  if (!match) return null;
  return <EventDetail slug={params.slug} />;
}

function RegistrationPanel({ event }: { event: EventRow }) {
  const regOpen = isRegistrationOpen(event.registration_deadline, event.starts_at, event.verification_status);
  const past = new Date(event.starts_at).getTime() < Date.now();
  const cancelled = event.verification_status === 'annule';

  if (cancelled || past) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-ash-400">
        {cancelled ? 'Cet événement a été annulé.' : 'Cet événement est déjà terminé — les inscriptions sont closes.'}
      </div>
    );
  }

  if (!event.registration_url || !regOpen) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-ash-400">
        {regOpen
          ? 'Le lien d\'inscription sera communiqué prochainement. Suivez la source officielle ci-dessous.'
          : `Les inscriptions sont fermées : la clôture était le ${event.registration_deadline ? formatDateTime(event.registration_deadline) : '—'}.`}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ember-500/40 bg-gradient-to-br from-ember-500/15 via-ember-500/5 to-transparent p-5">
      <p className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-ember-300">
        <Swords className="h-5 w-5" aria-hidden /> Inscriptions ouvertes
      </p>
      <dl className="mt-3 grid gap-2 text-sm text-ash-200 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-ember-400" aria-hidden />
          <span>
            Début : <strong className="text-white">{formatDateTime(event.starts_at)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Hourglass className="h-4 w-4 shrink-0 text-ember-400" aria-hidden />
          <span>
            Clôture : <strong className="text-white">{event.registration_deadline ? formatDateTime(event.registration_deadline) : 'non précisée'}</strong>
          </span>
        </div>
      </dl>
      <a
        href={event.registration_url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="btn-fire mt-4 w-full animate-pulse-glow py-3 text-base sm:w-auto"
      >
        <UserCheck className="h-5 w-5" aria-hidden /> S'inscrire maintenant
      </a>
      <p className="mt-2 text-xs text-ash-400">
        L'inscription se fait auprès de l'organisateur, sur son formulaire officiel — gratuit pour les joueurs.
      </p>
    </div>
  );
}

function StickyRegisterBar({ event }: { event: EventRow }) {
  const regOpen = isRegistrationOpen(event.registration_deadline, event.starts_at, event.verification_status);
  const past = new Date(event.starts_at).getTime() < Date.now();
  const cancelled = event.verification_status === 'annule';
  if (cancelled || past || !event.registration_url || !regOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ember-500/30 bg-ash-950/90 px-4 py-3 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-ember-300">Inscriptions ouvertes</p>
          <p className="truncate text-sm font-semibold text-white">
            Clôture : {event.registration_deadline ? formatDateTime(event.registration_deadline) : 'à préciser'}
          </p>
        </div>
        <a
          href={event.registration_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="btn-fire shrink-0 px-4 py-2.5"
        >
          S'inscrire <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </div>
  );
}

function EventDetail({ slug }: { slug: string }) {
  const [event, setEvent] = useState<EventRow | null>(null);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('publication_status', 'publie')
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setEvent(data);
        document.title = `${data.title} — MadaFF Hub`;
        supabase
          .from('results')
          .select('*')
          .eq('event_id', data.id)
          .order('placement', { ascending: true })
          .then(({ data: resultData }) => {
            if (!cancelled) {
              setResults(resultData ?? []);
              setLoading(false);
            }
          });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <Spinner />;
  if (notFound || !event) {
    return (
      <Page>
        <EmptyState
          title="Événement introuvable"
          hint="Cet événement n'existe pas, n'est pas encore publié, ou a été retiré."
        />
        <div className="mt-4 text-center">
          <Link href="/evenements" className="text-sm font-bold uppercase tracking-wider text-ember-400 hover:text-ember-300">
            Retour au catalogue
          </Link>
        </div>
      </Page>
    );
  }

  const regOpen = isRegistrationOpen(event.registration_deadline, event.starts_at, event.verification_status);

  return (
    <Page>
      <Link href="/evenements" className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-ash-400 transition hover:text-ember-400">
        ← Tous les événements
      </Link>

      <div className="mt-3 animate-fade-up rounded-2xl border border-white/10 bg-ash-900/80 p-6 shadow-xl shadow-black/30 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <VerificationBadge status={event.verification_status} />
          <TypeBadge type={event.event_type} region={event.region} />
          {regOpen && (
            <span className="chip bg-ember-500/15 text-ember-300 ring-ember-400/40">
              Inscriptions ouvertes
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-[0.95] tracking-wide text-white sm:text-5xl">
          {event.title}
        </h1>
        <p className="mt-1.5 text-sm font-semibold uppercase tracking-wide text-ash-400">
          Organisé par <span className="text-ember-400">{event.organizer_name}</span>
        </p>

        {event.description && <p className="mt-4 leading-relaxed text-ash-200">{event.description}</p>}

        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: CalendarDays, label: 'Début', value: formatDateTime(event.starts_at) },
            { icon: Hourglass, label: 'Clôture des inscriptions', value: event.registration_deadline ? formatDateTime(event.registration_deadline) : 'Non précisée' },
            { icon: Swords, label: 'Mode de jeu', value: event.game_mode },
            {
              icon: event.event_type === 'presentiel' ? CalendarDays : Tv,
              label: 'Format',
              value: event.event_type === 'en_ligne' ? 'En ligne' : `Présentiel${event.region ? ` — ${event.region}` : ''}`,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-ash-950/60 p-4">
              <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-ash-400">
                <Icon className="h-3.5 w-3.5 text-ember-400" aria-hidden /> {label}
              </dt>
              <dd className="mt-1.5 font-display text-xl font-semibold leading-tight text-white">{value}</dd>
            </div>
          ))}
        </dl>

        {event.prizes && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h2 className="flex items-center gap-1.5 font-display text-xl font-semibold uppercase tracking-wide text-amber-300">
              <Trophy className="h-5 w-5" aria-hidden /> Récompenses
            </h2>
            <p className="mt-1 text-sm text-amber-100">{event.prizes}</p>
          </div>
        )}

        {event.rules && (
          <div className="mt-4 rounded-xl border border-white/10 bg-ash-950/60 p-4">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-white">Règles et conditions de participation</h2>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ash-300">{event.rules}</p>
          </div>
        )}

        <div className="mt-6">
          <RegistrationPanel event={event} />
        </div>

        {event.stream_url && (
          <div className="mt-4">
            <a
              href={event.stream_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn-ghost"
            >
              <Tv className="h-5 w-5" aria-hidden /> Regarder le direct
            </a>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <section className="mt-6 animate-fade-up rounded-2xl border border-white/10 bg-ash-900/80 p-6 shadow-xl shadow-black/30" aria-labelledby="results-title">
          <h2 id="results-title" className="flex items-center gap-2 font-display text-2xl font-semibold uppercase tracking-wide text-white">
            <Trophy className="h-6 w-6 text-amber-400" aria-hidden /> Résultats publiés
          </h2>
          <ol className="mt-4 divide-y divide-white/5">
            {results.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-lg font-bold ${
                      r.placement === 1
                        ? 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/50'
                        : r.placement === 2
                          ? 'bg-ash-300/15 text-ash-200 ring-1 ring-ash-300/40'
                          : r.placement === 3
                            ? 'bg-ember-500/20 text-ember-300 ring-1 ring-ember-400/50'
                            : 'bg-white/5 text-ash-400'
                    }`}
                  >
                    {r.placement}
                  </span>
                  {r.team_id ? (
                    <Link href="/equipes" className="font-semibold text-white transition hover:text-ember-300">
                      {r.team_label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-white">{r.team_label}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-ash-400">
                  {r.score !== null && <span>{r.score} pts</span>}
                  {r.evidence_url && (
                    <a
                      href={r.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1 font-semibold text-ember-400 hover:text-ember-300"
                    >
                      Preuve <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mb-16 mt-6 animate-fade-up rounded-2xl border border-white/10 bg-ash-900/80 p-6 shadow-xl shadow-black/30 md:mb-0" aria-labelledby="verification-title">
        <h2 id="verification-title" className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-white">
          <ShieldCheck className="h-5 w-5 text-emerald-400" aria-hidden /> Fiabilité de l'information
        </h2>
        <div className="mt-3 grid gap-2 text-sm text-ash-300 sm:grid-cols-2">
          <p>
            <span className="font-bold uppercase tracking-wide text-ash-200">Source de l'annonce : </span>
            {event.source_url ? (
              <a
                href={event.source_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 font-semibold text-ember-400 hover:text-ember-300"
              >
                Voir l'annonce originale <ExternalLink className="inline h-3.5 w-3.5" aria-hidden />
              </a>
            ) : (
              'Fournie directement par l\'organisateur'
            )}
          </p>
          <p>
            <span className="font-bold uppercase tracking-wide text-ash-200">Dernière vérification : </span>
            {event.last_verified_at ? formatDate(event.last_verified_at) : 'Pas encore vérifié'}
          </p>
        </div>
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-white/[0.03] p-3 text-xs leading-relaxed text-ash-400 ring-1 ring-white/10">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ember-400" aria-hidden />
          « Vérifié » signifie que les informations essentielles ont été contrôlées selon le processus du site. Cela
          ne signifie pas que Garena approuve ou sponsorise cet événement.
        </p>
        <div className="mt-4">
          <ReportButton contentType="event" contentId={event.id} contentLabel={event.title} />
        </div>
      </section>

      <StickyRegisterBar event={event} />
    </Page>
  );
}
