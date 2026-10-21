# MadaFF Hub

MadaFF Hub est une plateforme communautaire dédiée aux événements, équipes et créateurs Free Fire à Madagascar.

## Dossiers

- [`frontend/`](frontend/) — application web React/Vite.
- [`backend/`](backend/) — migrations et fonctions Supabase.
- [`docs/`](docs/) — architecture et déploiement.
- [`release/`](release/) — procédure de publication.

## Commandes

```bash
npm ci
npm run dev
npm run typecheck
npm run lint
npm run audit
npm run build
```

Le déploiement public est géré par Vercel à partir de la branche `main`. Les variables Supabase sont configurées uniquement dans l’environnement Vercel et dans un fichier local ignoré par Git.

- Production : [madaff.vercel.app](https://madaff.vercel.app)
- GitHub : [ventso00/FF-PROJECT-](https://github.com/ventso00/FF-PROJECT-)
