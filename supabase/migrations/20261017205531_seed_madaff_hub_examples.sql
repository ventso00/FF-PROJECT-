/*
# Seed MadaFF Hub example data

1. Purpose
   Populates the platform with clearly-identified EXAMPLE data so the pilot
   prototype can be tested with realistic content (spec 11, Etape 2:
   "Utiliser des données clairement identifiées comme exemples jusqu'à leur
   vérification"). All events carry verification_status 'a_verifier' unless
   noted, and descriptions mention they are examples.

2. Data Inserted
   - 3 organizers (community tournament hosts).
   - 6 teams with members (Antananarivo, Toamasina, Fianarantsoa, Mahajanga...).
   - 6 events: upcoming and past, online and in-person, covering different
     statuses (verified, to verify, past/completed, cancelled).
   - Results for the past event, tied to directory teams where possible.
   - 1 site_settings row with a homepage announcement.
   - All events are published so they appear in the public catalogue.

3. Security
   - No policy changes. RLS from the base migration applies unchanged.

4. Important Notes
   - Idempotent: uses ON CONFLICT on unique slugs / settings id so re-running
     does not duplicate rows.
   - Dates are relative to October 2026 (pilot period).
*/

INSERT INTO organizers (id, name, contact_url, is_verified) VALUES
  ('11111111-1111-1111-1111-111111111101', 'FF Community Mada', 'https://facebook.com/ffcommunitymada', true),
  ('11111111-1111-1111-1111-111111111102', 'Arena GG Tana', 'https://facebook.com/are-nagg-tana', true),
  ('11111111-1111-1111-1111-111111111103', 'Coastal Esports Toamasina', NULL, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO teams (id, name, slug, description, region, owner_name, contact_url, recruiting, is_featured, verified_at) VALUES
  ('22222222-2222-2222-2222-222222222201', 'Vako Vazaha Esports', 'vako-vazaha', 'EXAMPLE — Équipe compétitive fondée à Antananarivo en 2024. Spécialisée en mode escouade (Squad). Données d''exemple pour le pilote.', 'Antananarivo', 'Rado', 'https://facebook.com/vakorazaha', true, true, now()),
  ('22222222-2222-2222-2222-222222222202', 'Tsena Kings', 'tsena-kings', 'EXAMPLE — Communauté compétitive de Toamasina, active sur les tournois en ligne régionaux. Données d''exemple pour le pilote.', 'Toamasina', 'Feno', 'https://facebook.com/tsenakings', false, true, now()),
  ('22222222-2222-2222-2222-222222222203', 'Boeny Storm', 'boeny-storm', 'EXAMPLE — Équipe de Mahajanga, axée sur le mode Clash Squad. Données d''exemple pour le pilote.', 'Mahajanga', 'Koto', NULL, true, false, now()),
  ('22222222-2222-2222-2222-222222222204', 'Iavoloha Squad', 'iavoloha-squad', 'EXAMPLE — Équipe familiale d''Antsirabe, ambience avant tout. Données d''exemple pour le pilote.', 'Antsirabe', 'Mamy', NULL, false, false, now()),
  ('22222222-2222-2222-2222-222222222205', 'Fianar Warriors', 'fianar-warriors', 'EXAMPLE — Équipe de Fianarantsoa, participante régulière des LAN locales. Données d''exemple pour le pilote.', 'Fianarantsoa', 'Hery', 'https://facebook.com/fianarwarriors', true, false, now()),
  ('22222222-2222-2222-2222-222222222206', 'Diego Legends', 'diego-legends', 'EXAMPLE — Équipe d''Antsiranana (Diego), forte en battle solo/duo. Données d''exemple pour le pilote.', 'Antsiranana', 'Tsiky', NULL, false, false, now())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO team_members (team_id, nickname, membership_role) VALUES
  ('22222222-2222-2222-2222-222222222201', 'Rado_FF', 'Capitaine'),
  ('22222222-2222-2222-2222-222222222201', 'VazahaSniper', 'Joueur'),
  ('22222222-2222-2222-2222-222222222201', 'TanaRush', 'Joueur'),
  ('22222222-2222-2222-2222-222222222201', 'Mpiambinky', 'Remplaçant'),
  ('22222222-2222-2222-2222-222222222202', 'Feno_Captain', 'Capitaine'),
  ('22222222-2222-2222-2222-222222222202', 'CotierKing', 'Joueur'),
  ('22222222-2222-2222-2222-222222222202', 'SamojaGamer', 'Joueur'),
  ('22222222-2222-2222-2222-222222222203', 'KotoLeader', 'Capitaine'),
  ('22222222-2222-2222-2222-222222222203', 'StormMahajanga', 'Joueur'),
  ('22222222-2222-2222-2222-222222222203', 'BoenyShooter', 'Joueur'),
  ('22222222-2222-2222-2222-222222222204', 'MamyVava', 'Capitaine'),
  ('22222222-2222-2222-2222-222222222204', 'AntsirabePro', 'Joueur'),
  ('22222222-2222-2222-2222-222222222205', 'HeryWarrior', 'Capitaine'),
  ('22222222-2222-2222-2222-222222222205', 'FianarSniper', 'Joueur'),
  ('22222222-2222-2222-2222-222222222205', 'BetsileoRush', 'Joueur'),
  ('22222222-2222-2222-2222-222222222206', 'TsikyLegend', 'Capitaine'),
  ('22222222-2222-2222-2222-222222222206', 'DiegoAce', 'Joueur');

INSERT INTO events (id, organizer_id, organizer_name, title, slug, description, game_mode, event_type, region, starts_at, registration_deadline, registration_url, stream_url, prizes, rules, source_url, verification_status, publication_status, last_verified_at, published_at) VALUES
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 'FF Community Mada',
   'EXAMPLE — Tournoi Squad Battle Tana #12',
   'squad-battle-tana-12',
   'EXAMPLE — Tournoi mensuel en ligne ouvert aux équipes de toute Madagascar. 48 places, format poules puis phases finales. Donnée d''exemple pour le pilote.',
   'Squad (4v4)', 'en_ligne', NULL,
   '2026-11-08T14:00:00+03:00', '2026-11-05T23:59:00+03:00',
   'https://facebook.com/ffcommunitymada', 'https://youtube.com/live/example-squad-battle',
   'EXAMPLE — 100 000 Ar pour l''équipe gagnante (à confirmer par l''organisateur).',
   'EXAMPLE — Inscription gratuite. Une équipe par joueur. Anti-collusion strict. Emulateur interdit.',
   'https://facebook.com/ffcommunitymada', 'verifie', 'publie', '2026-10-15T10:00:00+03:00', '2026-10-15T10:00:00+03:00'),

  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102', 'Arena GG Tana',
   'EXAMPLE — LAN Clash Cup Antananarivo',
   'lan-clash-cup-antananarivo',
   'EXAMPLE — Compétition en présentiel au centre-ville d''Antananarivo. Postes fournis sur place, 16 équipes. Donnée d''exemple pour le pilote.',
   'Clash Squad', 'presentiel', 'Antananarivo',
   '2026-11-22T09:00:00+03:00', '2026-11-15T23:59:00+03:00',
   'https://forms.example.com/clash-cup', NULL,
   'EXAMPLE — Trophies + équipements gaming offerts par les sponsors.',
   'EXAMPLE — Frais de participation 5 000 Ar par équipe. Joueurs mineurs: autorisation parentale requise.',
   'https://facebook.com/are-nagg-tana', 'verifie', 'publie', '2026-10-16T08:30:00+03:00', '2026-10-16T08:30:00+03:00'),

  ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111103', 'Coastal Esports Toamasina',
   'EXAMPLE — Coupe du Littoral (Duo)',
   'coupe-du-littoral-duo',
   'EXAMPLE — Tournoi en ligne en duo, ouvert aux joueurs de la côte Est. Donnée d''exemple pour le pilote.',
   'Duo (2v2)', 'en_ligne', NULL,
   '2026-11-15T15:00:00+03:00', '2026-11-12T23:59:00+03:00',
   'https://forms.example.com/littoral', NULL,
   'EXAMPLE — Récompenses en crédits de jeu (détails à confirmer).',
   'EXAMPLE — Inscription gratuite, réservation prioritaire pour Toamasina.',
   NULL, 'a_verifier', 'publie', NULL, '2026-10-14T12:00:00+03:00'),

  ('33333333-3333-3333-3333-333333333304', NULL, 'Comité des Jeux Atsimonana',
   'EXAMPLE — Battle Royale Ouvert Tous',
   'battle-royale-ouvert-tous',
   'EXAMPLE — Grand tournoi battle royale ouvert à tous, sans qualification. Donnée d''exemple pour le pilote.',
   'Battle Royale', 'en_ligne', NULL,
   '2026-12-06T13:00:00+03:00', '2026-12-01T23:59:00+03:00',
   'https://forms.example.com/brtous', 'https://youtube.com/live/example-brtous',
   NULL,
   'EXAMPLE — Inscription gratuite. Fair-play exigé.',
   NULL, 'a_verifier', 'publie', NULL, '2026-10-13T16:45:00+03:00'),

  ('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111101', 'FF Community Mada',
   'EXAMPLE — Squad Battle Tana #11 (terminé)',
   'squad-battle-tana-11',
   'EXAMPLE — Édition précédente du tournoi mensuel, conservée en archive. Donnée d''exemple pour le pilote.',
   'Squad (4v4)', 'en_ligne', NULL,
   '2026-10-11T14:00:00+03:00', '2026-10-08T23:59:00+03:00',
   'https://facebook.com/ffcommunitymada', 'https://youtube.com/live/example-squad11',
   'EXAMPLE — 100 000 Ar pour l''équipe gagnante.',
   'EXAMPLE — Mêmes règles que l''édition #12.',
   'https://facebook.com/ffcommunitymada', 'termine', 'publie', '2026-10-12T09:00:00+03:00', '2026-10-12T09:00:00+03:00'),

  ('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111102', 'Arena GG Tana',
   'EXAMPLE — Tournoi anniversaire Ambatolampy (annulé)',
   'tournoi-anniversaire-ambatolampy',
   'EXAMPLE — Tournoi en présentiel initialement prévu à Ambatolampy, annulé par l''organisateur. Conservé en archive pour transparence. Donnée d''exemple.',
   'Squad (4v4)', 'presentiel', 'Ambatolampy',
   '2026-10-25T10:00:00+03:00', '2026-10-20T23:59:00+03:00',
   NULL, NULL, NULL,
   'EXAMPLE — Annulé pour raisons logistiques.',
   NULL, 'annule', 'publie', '2026-10-14T11:00:00+03:00', '2026-10-14T11:00:00+03:00')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO results (event_id, team_id, team_label, placement, score, evidence_url) VALUES
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222201', 'Vako Vazaha Esports', 1, 96, 'https://example.com/preuves/squad11-vainqueur'),
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222202', 'Tsena Kings', 2, 88, 'https://example.com/preuves/squad11-finaliste'),
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222205', 'Fianar Warriors', 3, 81, 'https://example.com/preuves/squad11-3e');

INSERT INTO site_settings (id, announcement) VALUES ('main', 'EXAMPLE — Bienvenue sur MadaFF Hub, le hub communautaire Free Fire de Madagascar. Les données affichées sont des exemples de démonstration pendant la phase pilote.')
ON CONFLICT (id) DO NOTHING;
