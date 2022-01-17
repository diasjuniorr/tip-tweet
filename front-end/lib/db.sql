-- Create a table for public "users"
create table users (
  id uuid references auth.users not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  twitter_user_id text unique,

  primary key (id),
  unique(twitter_user_id)
);

-- Create a table for "contracts"
create table contracts (
  id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now() ,
  deleted_at timestamp with time zone,
  user_id uuid not null,
  address text not null,
  active boolean not null default true,
  primary key (id),
  constraint fk_user_id foreign key (user_id) references users (id) on delete cascade  
);


alter table contracts enable row level security;

create policy "Users can select their own contracts."
  on contracts for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own contractws"
  on contracts for insert
  with check ( auth.uid() = user_id );

-- Create a table for "tips"
create table tips (
  id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone,
  contract_id uuid  not null,
  tweet_id text not null,
  nonce text not null,
  amount text not null,
  twitter_user_id text not null,
  signature text not null,
  primary key (id),
  constraint fk_contract_id foreign key (contract_id) references contracts (id) on delete cascade,
  constraint fk_twitter_user_id foreign key (twitter_user_id) references users (twitter_user_id) on delete cascade
);
