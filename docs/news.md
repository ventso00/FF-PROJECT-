# Veille des actualités Free Fire Madagascar

La veille est exécutée à deux moments : à chaque `npm run build` (donc à chaque déploiement Vercel) et chaque jour via le workflow GitHub `MadaFF daily news sync`, qui peut aussi être lancé manuellement.

Le script interroge plusieurs recherches publiques ciblées : tournois Free Fire Madagascar, équipes/joueurs/créateurs, FFWS Afrique et actualités générales. Il filtre les éléments vieux de plus de quatorze jours, exige un indice explicite de localisation malgache, déduplique les résultats et les classe en `Tournois`, `Communauté`, `Compétition` ou `Actualités`.

Le résultat est écrit dans `frontend/public/news.json`, puis affiché sur l’accueil et `/actualites`, avec source, date, catégorie et lien original. Les éléments restent indiqués comme non vérifiés tant qu’un modérateur ne les a pas confirmés.

Le système ne peut pas garantir toutes les nouvelles publiées sur Internet : les groupes privés, les pages nécessitant une connexion et les publications sans flux public ne sont pas contournés. Si aucune source récente et localisée n’est disponible, le site affiche un état vide honnête au lieu d’inventer une actualité.
