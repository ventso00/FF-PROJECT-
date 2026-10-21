# Développement et déploiement

## Développement local

Depuis la racine :

```bash
npm ci
cp frontend/.env.example frontend/.env
# renseigner les variables Supabase dans frontend/.env
npm run dev
```

## Vérifications

```bash
npm run typecheck
npm run lint
npm run audit
npm run build
```

## Vercel

Le projet Vercel utilise la racine du dépôt et le fichier `vercel.json`. Le build est `npm run build` et le résultat est `frontend/dist`.

Configurer dans Vercel, pour Production, Preview et Development :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Après chaque push sur `main`, Vercel reconstruit le frontend. Ne jamais mettre les valeurs de ces variables dans GitHub.

## Actualités quotidiennes

Le workflow `.github/workflows/news-sync.yml` met à jour chaque jour le fichier public `frontend/public/news.json`. Il peut être lancé immédiatement depuis l’onglet Actions avec `workflow_dispatch`. Voir [`docs/news.md`](news.md) pour les règles de fraîcheur et de validation.
