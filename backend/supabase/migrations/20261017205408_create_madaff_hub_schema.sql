/*
# Create MadaFF Hub MVP schema

1. Purpose
   Creates the core tables for the MadaFF Hub platform: organizer profiles,
   teams, team members, events, results, content reports, and site settings.
   This is the Phase B MVP schema supporting the public event catalogue,
   team directory, event proposal form, moderation queue, and reports.

2. New Tables
   - `organizers`
     - `id` (uuid, primary key)
     - `name` (text, organizer public name, not null)
     - `contact_url` (text, contact link, nullable)
     - `is_verified` (boolean, verification badge, default false)
     - `created_at` (timestamp)
   - `teams`
     - `id` (uuid, primary key)
     - `name` (text, team name, not null)
     - `slug` (text, unique URL identifier, not null)
     - `description` (text, team description, nullable)
     - `region` (text, declared region/city, nullable)
     - `logo_url` (text, team-provided logo, nullable)
     - `owner_name` (text, team lead public name, nullable)
     - `contact_url` (text, team public link, nullable)
     - `recruiting` (boolean, is the team looking for players, default false)
     - `is_featured` (boolean, homepage highlight, default false)
     - `verified_at` (timestamp, last verification, nullable)
     - `created_at`, `updated_at` (timestamps)
   - `team_members`
     - `id` (uuid, primary key)
     - `team_id` (uuid, FK to teams, on delete cascade)
     - `nickname` (text, public in-game nickname, not null)
     - `membership_role` (text, role in team, default 'Joueur')
     - `joined_at` (timestamp, default now)
   - `events`
     - `id` (uuid, primary key)
     - `organizer_id` (uuid, FK to organizers, nullable)
     - `organizer_name` (text, organizer name fallback, not null)
     - `title` (text, event title, not null)
     - `slug` (text, unique URL identifier, not null)
     - `description` (text, event description, nullable)
     - `game_mode` (text, game mode/format, not null, default 'Classique')
     - `event_type` (text, 'en_ligne' or 'presentiel', not null, default 'en_ligne')
     - `region` (text, city/region if in person, nullable)
     - `starts_at` (timestamp, start date/time, not null)
     - `registration_deadline` (timestamp, registration close, nullable)
     - `registration_url` (text, external registration link, nullable)
     - `stream_url` (text, broadcast link, nullable)
     - `prizes` (text, confirmed rewards info, nullable)
     - `rules` (text, participation rules, nullable)
     - `source_url` (text, original announcement source, nullable)
     - `contact_email` (text, submitter contact for follow-up, nullable)
     - `verification_status` (text: a_verifier, verifie, termine, annule, signale, default 'a_verifier')
     - `publication_status` (text: en_attente, publie, refuse, default 'en_attente')
     - `last_verified_at` (timestamp, nullable)
     - `published_at` (timestamp, nullable)
     - `created_at`, `updated_at` (timestamps)
   - `results`
     - `id` (uuid, primary key)
     - `event_id` (uuid, FK to events, on delete cascade)
     - `team_id` (uuid, FK to teams, nullable)
     - `team_label` (text, team name when not in directory, not null)
     - `placement` (integer, final rank, not null)
     - `score` (integer, points scored, nullable)
     - `evidence_url` (text, proof link, nullable)
     - `published_at` (timestamp, default now)
   - `reports`
     - `id` (uuid, primary key)
     - `content_type` (text: event, team, other, not null)
     - `content_id` (uuid, reported item id, nullable)
     - `content_label` (text, human-readable reference, nullable)
     - `reason` (text: perime, faux, identite, resultat, abus, lien_suspect, droits, autre)
     - `details` (text, free-text explanation, nullable)
     - `contact_email` (text, optional reporter contact, nullable)
     - `status` (text: nouveau, en_examen, resolu, rejete, default 'nouveau')
     - `moderator_notes` (text, internal notes, nullable)
     - `created_at`, `resolved_at` (timestamps)
   - `site_settings`
     - `id` (text, primary key, single row 'main')
     - `announcement` (text, homepage community news banner, nullable)
     - `updated_at` (timestamp)

3. Indexes
   - Events: indexes on `publication_status`, `starts_at`, `region`, `event_type`.
   - Teams: index on `slug` is the unique constraint itself.
   - Team members: index on `team_id`.
   - Reports: index on `status`.
   - Results: indexes on `event_id` and `team_id`.

4. Security
   - RLS enabled on every table.
   - Public READ access (anon + authenticated) on published events, published
     results, teams, team members, organizers, and site settings — this data is
     intentionally public for the directory and catalogue.
   - Public INSERT on `events` (event proposal form) and `reports`
     (report a problem form). Both forms are open to visitors per the spec;
     submissions land in 'pending' / 'new' status and require admin approval
     before becoming visible, so public insert cannot publish anything.
   - Public read on non-published event rows is NOT granted: the SELECT policy
     only exposes rows with publication_status = 'publie'.
   - No public UPDATE or DELETE on any table. Admin/moderation actions are
     performed via a service-role path (deployed separately).
   - No user-updatable metadata drives authorization.

5. Important Notes
   - No auth is required to browse the site (spec 3.1). The admin dashboard
     uses a moderation key through a server-side path, so no elevated
     privileges are exposed to the browser.
   - Slug uniqueness is enforced by unique constraints.
   - Non-published events are invisible to the public, satisfying MVP
     criterion 4 (admin approval before publication).
*/

CREATE TABLE IF NOT EXISTS organizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_url text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  region text,
  logo_url text,
  owner_name text,
  contact_url text,
  recruiting boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  membership_role text NOT NULL DEFAULT 'Joueur',
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES organizers(id) ON DELETE SET NULL,
  organizer_name text NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  game_mode text NOT NULL DEFAULT 'Classique',
  event_type text NOT NULL DEFAULT 'en_ligne'
    CHECK (event_type IN ('en_ligne', 'presentiel')),
  region text,
  starts_at timestamptz NOT NULL,
  registration_deadline timestamptz,
  registration_url text,
  stream_url text,
  prizes text,
  rules text,
  source_url text,
  contact_email text,
  verification_status text NOT NULL DEFAULT 'a_verifier'
    CHECK (verification_status IN ('a_verifier','verifie','termine','annule','signale')),
  publication_status text NOT NULL DEFAULT 'en_attente'
    CHECK (publication_status IN ('en_attente','publie','refuse')),
  last_verified_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  team_label text NOT NULL,
  placement integer NOT NULL,
  score integer,
  evidence_url text,
  published_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL DEFAULT 'event'
    CHECK (content_type IN ('event','team','other')),
  content_id uuid,
  content_label text,
  reason text NOT NULL
    CHECK (reason IN ('perime','faux','identite','resultat','abus','lien_suspect','droits','autre')),
  details text,
  contact_email text,
  status text NOT NULL DEFAULT 'nouveau'
    CHECK (status IN ('nouveau','en_examen','resolu','rejete')),
  moderator_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY DEFAULT 'main',
  announcement text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_publication ON events(publication_status);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_region ON events(region);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_results_event ON results(event_id);
CREATE INDEX IF NOT EXISTS idx_results_team ON results(team_id);

ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_organizers" ON organizers;
CREATE POLICY "public_read_organizers" ON organizers FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_teams" ON teams;
CREATE POLICY "public_read_teams" ON teams FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_team_members" ON team_members;
CREATE POLICY "public_read_team_members" ON team_members FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_published_events" ON events;
CREATE POLICY "public_read_published_events" ON events FOR SELECT
TO anon, authenticated USING (publication_status = 'publie');

DROP POLICY IF EXISTS "public_submit_events" ON events;
CREATE POLICY "public_submit_events" ON events FOR INSERT
TO anon, authenticated WITH CHECK (publication_status = 'en_attente');

DROP POLICY IF EXISTS "public_read_results" ON results;
CREATE POLICY "public_read_results" ON results FOR SELECT
TO anon, authenticated USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = results.event_id AND e.publication_status = 'publie'
  )
);

DROP POLICY IF EXISTS "public_submit_reports" ON reports;
CREATE POLICY "public_submit_reports" ON reports FOR INSERT
TO anon, authenticated WITH CHECK (status = 'nouveau');

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
TO anon, authenticated USING (true);
