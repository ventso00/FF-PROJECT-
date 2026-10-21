# Backend Supabase

Le backend MadaFF Hub se trouve dans `backend/supabase/`.

- `migrations/` contient le schéma, les données d’exemple et les tables d’administration.
- `functions/admin-moderation/` contient la fonction Edge de modération.
- `config.toml` contient la configuration Supabase locale.

Appliquer les migrations avec la CLI Supabase depuis la racine du projet, après avoir lié le bon projet distant. Les secrets et identifiants Supabase doivent rester dans l’environnement local ou dans les variables sécurisées du fournisseur.
