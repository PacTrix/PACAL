-- Migration V2 : ajout des colonnes OpenFoodFacts sur pacal_entry
-- Exécutée manuellement sur le NAS (drizzle-kit non disponible en prod)
--
-- ⚠️ Casing Drizzle → SQL : kcalPer100g → kcal_per100g (sans underscore avant le chiffre)
-- Toutes les colonnes sont nullable pour préserver la compatibilité avec les entrées V1 existantes.

ALTER TABLE "pacal_entry" ADD COLUMN "barcode" varchar(50);
ALTER TABLE "pacal_entry" ADD COLUMN "nutriscore" varchar(2);
ALTER TABLE "pacal_entry" ADD COLUMN "nova" integer;
ALTER TABLE "pacal_entry" ADD COLUMN "greenscore" varchar(2);
ALTER TABLE "pacal_entry" ADD COLUMN "kcal_per100g" real;
ALTER TABLE "pacal_entry" ADD COLUMN "kcal_per_portion" real;
ALTER TABLE "pacal_entry" ADD COLUMN "of_incomplete" boolean DEFAULT false;
