import { Link } from 'wouter';
import { Calendar, MapPin, Monitor, Users, ExternalLink } from 'lucide-react';
import type { EventRow } from '@/lib/types';
import { formatDateTime, isEventPast, timeUntil, isRegistrationOpen } from '@/lib/utils';
import { VerificationBadge, TypeBadge } from '@/components/Badges';

export function EventCard({ event }: { event: EventRow }) {
  const past = isEventPast(event.starts_at);
  const cancelled = event.verification_status === 'annule';
  const regOpen = isRegistrationOpen(
    event.registration_deadline,
    event.starts_at,
    event.verification_status,
  );

  return (
    <Link
      href={`/evenements/${event.slug}`}
      className="card-dark card-hover group block p-5 animate-fade-up"
    >
      <div className="flex flex-wrap items-center gap-2">
        <VerificationBadge status={event.verification_status} />
        <TypeBadge type={event.event_type} region={event.region} />
        {regOpen && !past && (
          <span className="chip bg-ember-500/15 text-ember-300 ring-ember-400/40">
            Inscriptions ouvertes
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-2xl font-semibold uppercase leading-none tracking-wide text-white transition group-hover:text-fire">
        {event.title}
      </h3>
      {event.description && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ash-400">{event.description}</p>
      )}
      <dl className="mt-3 space-y-1.5 text-sm text-ash-300">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-ember-400" aria-hidden />
          <dt className="sr-only">Date</dt>
          <dd>
            {formatDateTime(event.starts_at)}
            {!past && !cancelled && (
              <span className="ml-1.5 text-xs font-bold uppercase text-ember-400">({timeUntil(event.starts_at)})</span>
            )}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          {event.event_type === 'presentiel' ? (
            <MapPin className="h-4 w-4 shrink-0 text-ember-400" aria-hidden />
          ) : (
            <Monitor className="h-4 w-4 shrink-0 text-ember-400" aria-hidden />
          )}
          <dt className="sr-only">Lieu</dt>
          <dd>{event.event_type === 'presentiel' ? event.region ?? 'Lieu à confirmer' : 'En ligne'}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0 text-ember-400" aria-hidden />
          <dt className="sr-only">Organisateur</dt>
          <dd>{event.organizer_name}</dd>
        </div>
      </dl>
      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-ember-400 transition group-hover:gap-2.5">
        Voir la fiche & s'inscrire <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </span>
    </Link>
  );
}
