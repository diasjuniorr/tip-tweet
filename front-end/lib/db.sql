create or replace function auth.twitterid() returns text as $$
SELECT current_setting('request.jwt.claims', true)::json#>>'{user_metadata,sub}';
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

create policy "Anyone can post a tip."
  on tips for insert
  with check ( auth.uid() = id );

create policy "Only tweet owners can get their tips"
  on tips
  for select
  using ( auth.twitterID() = tweet_owner_id );