# Veille des actualités Free Fire Madagascar

Le workflow GitHub `MadaFF daily news sync` s’exécute chaque jour à 05:15 UTC et peut aussi être lancé manuellement. Il interroge des flux publics Google News ciblés, filtre les titres liés à Free Fire et exige un indice explicite de localisation malgache.

Le flux produit `frontend/public/news.json`, qui est affiché sur l’accueil et la page `/actualites`. Les éléments portent leur source, leur lien et leur date. Ils sont présentés comme non vérifiés tant qu’un modérateur ne les a pas confirmés.

Le filtre conserve uniquement les quatorze derniers jours. Il est volontairement conservateur : une journée sans résultat fiable affiche « Aucune actualité vérifiée aujourd’hui ». Les groupes Facebook privés, les publications nécessitant une connexion et les contenus non accessibles publiquement ne sont pas contournés.

Pour une veille éditoriale réellement exhaustive, ajouter ensuite des flux RSS officiels ou des sources partenaires locales dans `scripts/update-news.mjs`, avec l’accord de leurs propriétaires.
