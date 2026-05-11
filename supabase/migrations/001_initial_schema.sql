-- Taiwan 50 Financial Trend Tracker schema

create table if not exists tracking_stocks (
  id uuid primary key default gen_random_uuid(),
  stock_id text unique not null,
  stock_name text not null,
  industry_type text not null default ''
);

create table if not exists financial_reports (
  stock_id text not null references tracking_stocks(stock_id) on delete cascade,
  year int not null,
  quarter int not null,
  gross_margin float,
  operating_margin float,
  net_margin float,
  eps float,
  is_full_year bool not null default false,
  constraint financial_reports_pkey unique (stock_id, year, quarter)
);

create table if not exists sync_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null check (status in ('success', 'fail')),
  message text,
  stocks_synced int not null default 0
);

-- Index for fast per-stock lookups
create index if not exists idx_financial_reports_stock_id on financial_reports(stock_id);
create index if not exists idx_financial_reports_year_quarter on financial_reports(stock_id, year desc, quarter desc);
