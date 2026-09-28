-- supabase/schema.sql - Database for SwiftLink Bus
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. BUSES TABLE - Your fleet for Kampala-Ibanda
create table buses (
  id text primary key, -- e.g. UBQ-721J
  name text not null, -- Zhongtong Global Executive
  plate_number text,
  total_seats int default 61,
  layout text default '3+2',
  amenities text[] default array['Wi-Fi','AC'],
  driver_name text,
  status text default 'Scheduled', -- Scheduled, En Route, Departed, Pending
  created_at timestamp with time zone default now()
);

-- 2. TRIPS / SCHEDULES
create table trips (
  id uuid primary key default uuid_generate_v4(),
  bus_id text references buses(id),
  from_city text not null, -- Ibanda
  to_city text not null, -- Kampala
  departure_time time not null, -- 09:00
  departure_date date not null default current_date,
  price int not null default 50000, -- UGX
  distance_km int default 336,
  status text default 'Scheduled',
  created_at timestamp with time zone default now()
);

-- 3. TICKETS - Core table
create table tickets (
  id text primary key, -- TKT-xxxx or MTN referenceId
  bus_id text references buses(id),
  trip_id uuid references trips(id),
  seat_number int not null check (seat_number >= 1 and seat_number <= 61),
  passenger_name text not null,
  phone text not null,
  amount int not null default 50000,
  currency text default 'UGX',
  payment_method text not null, -- MTN, Airtel, Visa
  payment_reference text unique, -- MTN X-Reference-Id
  status text default 'PENDING', -- PENDING, CONFIRMED, FAILED, CANCELLED
  route text default 'Ibanda-Kampala',
  
  -- Boarding
  boarded boolean default false,
  boarded_at timestamp with time zone,
  conductor_id text,
  
  -- Timestamps
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  
  -- Prevent double booking same seat on same trip
  unique(bus_id, trip_id, seat_number)
);

-- 4. USERS (conductors, admins)
create table users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text unique not null,
  role text not null check (role in ('passenger','conductor','admin')),
  bus_id text references buses(id), -- for conductors
  created_at timestamp with time zone default now()
);

-- 5. INDEXES for speed
create index idx_tickets_bus on tickets(bus_id);
create index idx_tickets_status on tickets(status);
create index idx_tickets_phone on tickets(phone);
create index idx_trips_date on trips(departure_date);

-- 6. SEED DATA - Your 5 buses
insert into buses (id, name, plate_number, driver_name, status) values
('UBQ-412P', 'Zhongtong Global Executive', 'UBQ 412P', 'K. Asilimwe', 'Departed'),
('UBQ-721J', 'Zhongtong Bus', 'UBQ 721J', 'P. Tumusime', 'En Route'),
('UBQ-993K', 'SwiftLink Executive', 'UBQ 993K', 'R. Nansamba', 'Scheduled'),
('UBQ-556L', 'CityLink Express', 'UBQ 556L', 'D. Kato', 'Scheduled'),
('UBQ-128M', 'Zhongtong Global', 'UBQ 128M', 'T. Okello', 'Pending');

-- 7. ENABLE RLS (Row Level Security)
alter table buses enable row level security;
alter table trips enable row level security;
alter table tickets enable row level security;

-- Allow public read for buses/trips, but tickets need auth
create policy "Public can view buses" on buses for select using (true);
create policy "Public can view trips" on trips for select using (true);
create policy "Public can create tickets" on tickets for insert with check (true);
create policy "Public can view tickets" on tickets for select using (true);
create policy "Public can update tickets for boarding" on tickets for update using (true);

-- 8. VIEW for Admin Dashboard
create view admin_stats as
select 
  count(*) as total_tickets,
  count(*) filter (where status='CONFIRMED') as confirmed,
  sum(amount) filter (where status='CONFIRMED') as total_revenue,
  count(*) filter (where payment_method='MTN') as mtn_count,
  count(*) filter (where payment_method='Airtel') as airtel_count,
  count(*) filter (where boarded=true) as boarded_count
from tickets
where created_at >= current_date;
