# Architecture MadaFF Hub

MadaFF Hub est organisé en monorepo pour séparer clairement l’interface web, le backend Supabase et la documentation.

## Structure

- `frontend/` : application React + TypeScript + Vite, styles Tailwind et routes publiques.
- `backend/supabase/` : configuration Supabase, migrations SQL, données d’exemple et fonctions Edge.
- `docs/` : architecture, développement, déploiement, veille d’actualité et conventions du projet.
- `release/` : notes et checklist de publication.
- `.github/workflows/` : vérifications automatiques sur chaque push et pull request.
- `vercel.json` : configuration de build et de routage SPA Vercel.
- `package.json` : scripts racine et workspace npm.

## Flux de données

Le frontend utilise le client Supabase avec `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Les migrations et fonctions du dossier `backend/supabase/` doivent être appliquées au projet Supabase associé avant la mise en production.

Les secrets ne sont jamais versionnés. Le fichier `frontend/.env.example` décrit uniquement les noms de variables attendus.
