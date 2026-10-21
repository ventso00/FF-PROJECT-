/*
# Admin settings and audit log for MadaFF Hub

1. Purpose
   Adds two locked-down tables used by the admin dashboard:
   - `admin_settings`: stores the SHA-256 hash of the moderation passphrase.
   - `audit_logs`: records every admin/moderation action (actor, action,
     entity type, entity id, details, timestamp) — spec 6 and 7 requirement
     that sensitive actions be journalized.

2. New Tables
   - `admin_settings`
     - `id` (text, primary key, single row 'main')
     - `passphrase_hash` (text, SHA-256 hex of the moderation passphrase)
     - `updated_at` (timestamp)
   - `audit_logs`
     - `id` (uuid, primary key)
     - `actor` (text, e.g. 'admin')
     - `action` (text, e.g. 'publish_event', 'reject_event', 'resolve_report')
     - `entity_type` (text, e.g. 'event', 'report', 'settings')
     - `entity_id` (text, id of the affected row)
     - `details` (text, free-text context, no sensitive data)
     - `created_at` (timestamp)

3. Security — deny-by-default
   - RLS enabled on both tables.
   - NO public policies at all: anon and authenticated cannot SELECT,
     INSERT, UPDATE or DELETE anything. The admin edge function accesses
     these tables with the service role, which bypasses RLS.
   - The passphrase is stored only as a SHA-256 hash, never in plain text.

4. Important Notes
   - No data loss risk: brand-new empty tables.
*/

CREATE TABLE IF NOT EXISTS admin_settings (
  id text PRIMARY KEY DEFAULT 'main',
  passphrase_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text NOT NULL DEFAULT 'admin',
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

INSERT INTO admin_settings (id, passphrase_hash) VALUES
  ('main', '2b910319eb94b898f1019040540b1d06d2b2cfbbeb8c027753a3653601006911')
ON CONFLICT (id) DO NOTHING;
