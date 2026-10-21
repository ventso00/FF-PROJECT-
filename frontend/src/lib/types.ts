export type EventType = 'en_ligne' | 'presentiel';

export type VerificationStatus =
  | 'a_verifier'
  | 'verifie'
  | 'termine'
  | 'annule'
  | 'signale';

export type PublicationStatus = 'en_attente' | 'publie' | 'refuse';

export interface Organizer {
  id: string;
  name: string;
  contact_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface Creator {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  categories: string[];
  links: CreatorLink[];
  publication_status: PublicationStatus;
  is_featured: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatorLink {
  label: string;
  url: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region: string | null;
  logo_url: string | null;
  owner_name: string | null;
  contact_url: string | null;
  recruiting: boolean;
  is_featured: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  nickname: string;
  membership_role: string;
  joined_at: string;
}

export interface EventRow {
  id: string;
  organizer_id: string | null;
  organizer_name: string;
  title: string;
  slug: string;
  description: string | null;
  game_mode: string;
  event_type: EventType;
  region: string | null;
  starts_at: string;
  registration_deadline: string | null;
  registration_url: string | null;
  stream_url: string | null;
  prizes: string | null;
  rules: string | null;
  source_url: string | null;
  contact_email: string | null;
  verification_status: VerificationStatus;
  publication_status: PublicationStatus;
  last_verified_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResultRow {
  id: string;
  event_id: string;
  team_id: string | null;
  team_label: string;
  placement: number;
  score: number | null;
  evidence_url: string | null;
  published_at: string;
}

export type ReportReason =
  | 'perime'
  | 'faux'
  | 'identite'
  | 'resultat'
  | 'abus'
  | 'lien_suspect'
  | 'droits'
  | 'autre';

export interface ReportRow {
  id: string;
  content_type: 'event' | 'team' | 'other';
  content_id: string | null;
  content_label: string | null;
  reason: ReportReason;
  details: string | null;
  contact_email: string | null;
  status: 'nouveau' | 'en_examen' | 'resolu' | 'rejete';
  moderator_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface AuditLogRow {
  id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string | null;
  created_at: string;
}

export interface AdminSnapshot {
  pendingEvents: EventRow[];
  events: Pick<
    EventRow,
    'id' | 'title' | 'slug' | 'publication_status' | 'verification_status' | 'starts_at' | 'updated_at' | 'organizer_name'
  >[];
  openReports: ReportRow[];
  auditLogs: AuditLogRow[];
  announcement: string | null;
  creators: Pick<Creator, 'id' | 'name' | 'slug' | 'publication_status' | 'is_featured' | 'updated_at'>[];
  pendingCreators: Creator[];
}

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  a_verifier: 'À vérifier',
  verifie: 'Vérifié',
  termine: 'Terminé',
  annule: 'Annulé',
  signale: 'Signalé',
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  perime: 'Annonce expirée ou fausse',
  faux: 'Information incorrecte',
  identite: 'Usurpation d\'identité',
  resultat: 'Résultat contesté',
  abus: 'Comportement abusif',
  lien_suspect: 'Lien suspect',
  droits: 'Atteinte aux droits d\'autrui',
  autre: 'Autre',
};

export const REGIONS = [
  'Antananarivo',
  'Antsirabe',
  'Toamasina',
  'Mahajanga',
  'Fianarantsoa',
  'Toliara',
  'Antsiranana',
];
