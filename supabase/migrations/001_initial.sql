-- phones table
create table if not exists phones (
  id uuid primary key default gen_random_uuid(),
  model text not null,
  brand text not null,
  price_cents integer not null check (price_cents >= 0),
  color text,
  battery_pct integer check (battery_pct >= 0 and battery_pct <= 100),
  reference text,
  grade text check (grade in ('A', 'B', 'C', 'D')),
  description text,
  images text[] default '{}',
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- orders table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  phone_id uuid not null references phones(id) on delete restrict,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  amount_cents integer not null,
  sentoo_tx_id text unique,
  sentoo_payment_url text,
  sentoo_qr_url text,
  payment_status text not null default 'created'
    check (payment_status in ('created','issued','pending','success','failed','cancelled','expired','manual')),
  notifications_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- auto-update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger phones_updated_at
  before update on phones
  for each row execute function update_updated_at();

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- indexes
create index idx_phones_status on phones(status);
create index idx_phones_brand on phones(brand);
create index idx_orders_phone_id on orders(phone_id);
create index idx_orders_sentoo_tx_id on orders(sentoo_tx_id);
create index idx_orders_payment_status on orders(payment_status);

-- RLS
alter table phones enable row level security;
alter table orders enable row level security;

-- phones: public can read available
create policy "Public can view available phones"
  on phones for select
  using (status = 'available');

-- phones: authenticated full CRUD
create policy "Authenticated full access to phones"
  on phones for all
  to authenticated
  using (true)
  with check (true);

-- orders: authenticated full CRUD
create policy "Authenticated full access to orders"
  on orders for all
  to authenticated
  using (true)
  with check (true);

-- Storage bucket for phone images (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('phone-images', 'phone-images', true);
