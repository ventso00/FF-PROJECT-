/*
# Add creators feature (Notion V1.1 — écran E05, backlog P1 « profils créateurs »)

1. Purpose
   Adds public creator profiles per the MadaFF Hub functional spec V1.1:
   a public fiche with pseudonym, description, categories and channel links,
   manageable from the admin dashboard. Data lives in a new `creators` table.

2. New Tables
   - `creators`
     - `id` (uuid, primary key)
     - `name` (text, creator pseudonym, not null)
     - `slug` (text, unique URL identifier, not null)
     - `bio` (text, short presentation, nullable)
     - `categories` (text array, content categories, default empty)
     - `links` (jsonb array of {label, url}, default empty)
     - `is_featured` (boolean, homepage highlight, default false)
     - `verified_at` (timestamp, last verification, nullable)
     - `created_at`, `updated_at` (timestamps)

3. Indexes
   - `creators`: indexes on `slug` (unique constraint itself), `is_featured`.

4. Security
   - RLS enabled on `creators`.
   - Public READ for anon + authenticated: creator fiches are public pages.
   - No public INSERT/UPDATE/DELETE — creators are added and verified via the
     admin moderation edge function (service role), same as teams.

5. Important Notes
   - Seeded rows are labelled fictitious examples and only appear in the
     directory once published from the admin dashboard (publication_status).
*/

CREATE TABLE IF NOT EXISTS creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  bio text,
  categories text[] NOT NULL DEFAULT '{}',
  links jsonb NOT NULL DEFAULT '[]',
  publication_status text NOT NULL DEFAULT 'en_attente'
    CHECK (publication_status IN ('en_attente','publie','refuse')),
  is_featured boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creators_publication ON creators(publication_status);
CREATE INDEX IF NOT EXISTS idx_creators_featured ON creators(is_featured);

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_creators" ON creators;
CREATE POLICY "public_read_published_creators" ON creators FOR SELECT
TO anon, authenticated USING (publication_status = 'publie');
