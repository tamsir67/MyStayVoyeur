# Synchronisation Airtable — ce qu'il faut savoir

Le site **s'adapte automatiquement** à la structure de votre base Airtable :

- Les noms de tables peuvent être en minuscules (`listings`, `bookings`, `reviews`, `messages`)
  et la table des utilisateurs peut s'appeler `profiles`. Lancez `npm run airtable:fix` une fois
  pour que le site enregistre les vrais noms.
- Le site lit la structure des tables (scope `schema.bases:read`) et n'envoie **que les colonnes
  qui existent**. Les colonnes absentes sont ignorées, sans erreur.
- Les valeurs sont converties dans le type de la colonne (texte, nombre, case à cocher, date,
  liste déroulante, pièce jointe…). Pour les listes déroulantes, seules les options déjà
  existantes sont utilisées (un « Editor » ne peut pas en créer).
- Les colonnes calculées (formules, created time…) ne sont jamais modifiées.

## Seule exigence : une colonne `id`

Chaque table doit avoir une colonne **`id`** de type *Single line text*. Elle permet de mettre à
jour une ligne existante au lieu de créer un doublon. Les lignes ajoutées à la main dans
Airtable doivent avoir un `id` rempli (ex. `lst_001`, `bk_001`).

## Commandes

- `npm run airtable:check` : diagnostic complet (token, base, tables, colonne id, listes déroulantes, test d'écriture)
- `npm run airtable:fix` : même chose + enregistre dans le site les vrais noms de vos tables
