create or replace function auth.twitterID() returns text as $$
  select nullif(current_setting('request.jwt.claim.user_metada.sub', true), '')::text;
$$ language sql;

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


create policy "Only tweet owners can get their tips"
  on tips
  for select
  using ( auth.twitterID() = tweet_owner_id );