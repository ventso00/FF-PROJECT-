import type { PublicationStatus, VerificationStatus } from '@/lib/types';

const verificationStyles: Record<VerificationStatus, string> = {
  a_verifier: 'bg-amber-500/15 text-amber-300 ring-amber-400/40',
  verifie: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/40',
  termine: 'bg-white/5 text-ash-300 ring-white/15',
  annule: 'bg-red-500/15 text-red-300 ring-red-400/40',
  signale: 'bg-orange-500/15 text-orange-300 ring-orange-400/40',
};

const verificationLabels: Record<VerificationStatus, string> = {
  a_verifier: 'À vérifier',
  verifie: 'Vérifié',
  termine: 'Terminé',
  annule: 'Annulé',
  signale: 'Signalé',
};

const publicationLabels: Record<PublicationStatus, string> = {
  en_attente: 'En attente',
  publie: 'Publié',
  refuse: 'Refusé',
};

const publicationStyles: Record<PublicationStatus, string> = {
  en_attente: 'bg-amber-500/15 text-amber-300 ring-amber-400/40',
  publie: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/40',
  refuse: 'bg-red-500/15 text-red-300 ring-red-400/40',
};

const reportStatusStyles: Record<string, string> = {
  nouveau: 'bg-sky-500/15 text-sky-300 ring-sky-400/40',
  en_examen: 'bg-amber-500/15 text-amber-300 ring-amber-400/40',
  resolu: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/40',
  rejete: 'bg-white/5 text-ash-300 ring-white/15',
};

const reportStatusLabels: Record<string, string> = {
  nouveau: 'Nouveau',
  en_examen: 'En examen',
  resolu: 'Résolu',
  rejete: 'Rejeté',
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={`chip ${verificationStyles[status]}`}
    >
      {verificationLabels[status]}
    </span>
  );
}

export function PublicationBadge({ status }: { status: PublicationStatus }) {
  return (
    <span className={`chip ${publicationStyles[status]}`}>
      {publicationLabels[status]}
    </span>
  );
}

export function ReportStatusBadge({ status }: { status: string }) {
  return (
    <span className={`chip ${reportStatusStyles[status] ?? 'bg-white/5 text-ash-300 ring-white/15'}`}>
      {reportStatusLabels[status] ?? status}
    </span>
  );
}

export function TypeBadge({ type, region }: { type: 'en_ligne' | 'presentiel'; region: string | null }) {
  return (
    <span className="chip text-ash-200">
      {type === 'en_ligne' ? 'En ligne' : region ? `Présentiel · ${region}` : 'Présentiel'}
    </span>
  );
}
