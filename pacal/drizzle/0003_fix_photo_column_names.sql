-- Fix: renommer photo_path_1 → photo_path1 et photo_path_2 → photo_path2
-- Drizzle ORM (casing: snake_case) convertit photoPath1 → photo_path1
-- (underscore uniquement devant les majuscules, pas devant les chiffres)
ALTER TABLE "pacal_entry" RENAME COLUMN "photo_path_1" TO "photo_path1";
ALTER TABLE "pacal_entry" RENAME COLUMN "photo_path_2" TO "photo_path2";
