-- V1.2 schema migration
-- Story 1.14: weight_g → quantity (integer) + unit (varchar)
ALTER TABLE "pacal_entry" RENAME COLUMN "weight_g" TO "quantity";
ALTER TABLE "pacal_entry" ALTER COLUMN "quantity" TYPE integer USING round("quantity")::integer;
ALTER TABLE "pacal_entry" ADD COLUMN "unit" varchar(10);

-- Story 1.15: add note_type
ALTER TABLE "pacal_entry" ADD COLUMN "note_type" varchar(20);

-- Story 1.17: photo_path → photo_path_1 + photo_path_2
ALTER TABLE "pacal_entry" RENAME COLUMN "photo_path" TO "photo_path_1";
ALTER TABLE "pacal_entry" ADD COLUMN "photo_path_2" text;
