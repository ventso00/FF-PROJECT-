# Release MadaFF Hub

1. Mettre à jour le code et les migrations correspondantes.
2. Exécuter `npm ci`, `npm run typecheck`, `npm run lint`, `npm run audit` et `npm run build`.
3. Vérifier que la CI GitHub est verte.
4. Vérifier le déploiement Vercel sur la page d’accueil et au moins une route SPA.
5. Ajouter une entrée dans `CHANGELOG.md`.
6. Créer un tag Git versionné, par exemple `v1.0.1`, lorsque la release est validée.

Les migrations Supabase doivent être appliquées avant d’exposer une fonctionnalité qui dépend d’un nouveau schéma.
