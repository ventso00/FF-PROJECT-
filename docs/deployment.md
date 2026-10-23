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

`npm run build` lance d’abord `npm run news:update`, puis compile le frontend. Ainsi, chaque déploiement Vercel reconstruit le flux d’actualités avec les sources publiques disponibles au moment du build.

## Vercel

Le projet Vercel utilise la racine du dépôt et le fichier `vercel.json`. Le build est `npm run build` et le résultat est `frontend/dist`.

Configurer dans Vercel, pour Production, Preview et Development : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Après chaque push sur `main`, Vercel reconstruit le frontend et relance la veille.

## Actualités quotidiennes

Le workflow `.github/workflows/news-sync.yml` met aussi à jour chaque jour le fichier public `frontend/public/news.json`. Voir [`docs/news.md`](news.md) pour les règles de fraîcheur, de classement et de validation.
