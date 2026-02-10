-- Add delivery/pickup fulfillment support to orders
alter table orders
  add column fulfillment_type text not null default 'pickup'
    check (fulfillment_type in ('pickup', 'delivery')),
  add column delivery_address text,
  add column delivery_fee_cents integer not null default 0;
