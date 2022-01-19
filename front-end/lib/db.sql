
-- Create a table for "tips"
create table tips (
  id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone,
  tweet_id text not null,
  nonce text not null,
  amount text not null,
  tweet_owner_id text not null,
  signature text not null
);
