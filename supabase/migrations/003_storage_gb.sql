-- Add storage capacity (GB) to phones
alter table phones add column if not exists storage_gb integer check (storage_gb > 0);
