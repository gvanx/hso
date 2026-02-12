-- Add warranty columns to phones
ALTER TABLE phones ADD COLUMN warranty_type text;
ALTER TABLE phones ADD COLUMN warranty_text text;
